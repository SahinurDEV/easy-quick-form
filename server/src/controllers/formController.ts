import { type NextFunction, type Request, type Response } from 'express';
import { Types, type PipelineStage } from 'mongoose';
import { createFormSchema } from '@form-builder/validation';
import type { FormElementsType } from '@form-builder/validation/types';
import catchAsyncError from '../utils/catchAsyncError';
import Form from '../models/formModel';
import FormResponse from '../models/formResponseModel';
import AppError from '../utils/appError';

const SORTABLE_FIELDS = new Set([
  'name',
  'isActive',
  'createdAt',
  'updatedAt',
  'responseCount',
]);

const parseSort = (value?: string): Record<string, 1 | -1> | undefined => {
  if (!value) return undefined;

  const desc = value.startsWith('-');
  const field = desc ? value.slice(1) : value;

  if (!SORTABLE_FIELDS.has(field)) return undefined;

  return { [field]: desc ? -1 : 1 };
};

export const getAllForms = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.userId) return next(new AppError('Unauthorized', 401));

    const page = Number(req.query.page) || 0;
    const pageSize = Number(req.query.pageSize) || 10;
    const skip = page * pageSize;
    const searchQuery =
      typeof req.query.search === 'string' ? req.query.search : undefined;

    const query = searchQuery
      ? {
          user: new Types.ObjectId(req.userId),
          name: { $regex: searchQuery, $options: 'i' },
        }
      : { user: new Types.ObjectId(req.userId) };
    const total = await Form.countDocuments(query);

    if (req.query.page && req.query.page !== '0' && skip >= total)
      return next(new AppError('This page does not exist', 404));

    const responseCountStages: PipelineStage[] = [
      {
        $lookup: {
          from: FormResponse.collection.name,
          let: { formId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$form', '$$formId'] } } },
            { $count: 'count' },
          ],
          as: 'responseStats',
        },
      },
      {
        $addFields: {
          responseCount: {
            $ifNull: [{ $arrayElemAt: ['$responseStats.count', 0] }, 0],
          },
        },
      },
      { $project: { responseStats: 0 } },
    ];

    const sort = parseSort(req.query.sort?.toString());
    const pagination: PipelineStage[] = [{ $skip: skip }, { $limit: pageSize }];

    // Counting responses requires a lookup per form, so only do it before
    // pagination when the result is sorted by the count itself.
    const pipeline: PipelineStage[] = [{ $match: query }];

    if (sort && 'responseCount' in sort) {
      pipeline.push(...responseCountStages, { $sort: sort }, ...pagination);
    } else {
      if (sort) pipeline.push({ $sort: sort });
      pipeline.push(...pagination, ...responseCountStages);
    }

    const forms = await Form.aggregate(pipeline);

    res.status(200).json({
      status: 'success',
      data: {
        forms,
        total,
      },
    });
  },
);

export const deleteForms = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { forms } = req.body;
    if (!forms)
      return next(new AppError('Please provide list of form id!', 400));

    // Only touch forms the user owns, and remove their responses too.
    const ownedForms = await Form.find({
      _id: { $in: forms },
      user: req.userId,
    }).distinct('_id');

    await Form.deleteMany({ _id: { $in: ownedForms } });
    await FormResponse.deleteMany({ form: { $in: ownedForms } });

    res.sendStatus(204);
  },
);

export const getForm = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const form = await Form.findById(req.params.id);
    if (!form) return next(new AppError('No form found with that ID', 404));

    res.status(200).json({
      status: 'success',
      data: {
        form,
      },
    });
  },
);

export const createForm = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await createFormSchema.safeParseAsync(req.body);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return next(new AppError('Validation failed!', 400, fieldErrors));
    }

    const { name, elements } = result.data;

    const newForm = await Form.create({
      name,
      // Validation only checks that elements is a non-empty array.
      elements: elements as FormElementsType[],
      user: req.userId,
    });

    res.status(201).json({
      status: 'success',
      data: {
        form: newForm,
      },
    });
  },
);

export const updateForm = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // Owners can't reassign a form to another user.
    const { user: _user, ...updates } = req.body;
    const form = await Form.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updates,
      { new: true },
    );
    if (!form) return next(new AppError('No form found with that ID', 404));

    res.status(200).json({
      status: 'success',
      data: {
        form,
      },
    });
  },
);

export const deleteForm = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const form = await Form.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!form) return next(new AppError('No form found with that ID', 404));

    await FormResponse.deleteMany({ form: req.params.id });

    res.sendStatus(204);
  },
);
