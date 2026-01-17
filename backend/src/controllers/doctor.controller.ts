import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as doctorService from '../services/doctor.service';
import { asyncHandler } from '../utils/asyncHandler';

export const getQueue = asyncHandler(async (req: AuthRequest, res: Response) => {
    const queue = await doctorService.getDoctorQueue(req.user!.clinicId!, req.user!.id);
    res.status(200).json({ status: 'success', data: queue });
});

export const createAssessment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const assessment = await doctorService.saveAssessment(req.user!.clinicId!, req.user!.id, req.body);
    res.status(201).json({ status: 'success', data: assessment });
});

export const getHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const history = await doctorService.getHistory(req.user!.clinicId!, Number(req.params.patientId));
    res.status(200).json({ status: 'success', data: history });
});

export const getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await doctorService.getDoctorStats(req.user!.clinicId!, req.user!.id);
    res.status(200).json({ status: 'success', data: stats });
});

export const getActivities = asyncHandler(async (req: AuthRequest, res: Response) => {
    const activities = await doctorService.getDoctorActivities(req.user!.clinicId!, req.user!.id);
    res.status(200).json({ status: 'success', data: activities });
});

export const getTemplates = asyncHandler(async (req: AuthRequest, res: Response) => {
    const templates = await doctorService.getFormTemplates(req.user!.clinicId!);
    res.status(200).json({ status: 'success', data: templates });
});

export const getPatients = asyncHandler(async (req: AuthRequest, res: Response) => {
    const patients = await doctorService.getAssignedPatients(req.user!.clinicId!, req.user!.id);
    res.status(200).json({ status: 'success', data: patients });
});

export const getOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const orders = await doctorService.getDoctorOrders(req.user!.clinicId!, req.user!.id);
    res.status(200).json({ status: 'success', data: orders });
});

export const getRevenue = asyncHandler(async (req: AuthRequest, res: Response) => {
    const revenue = await doctorService.getRevenueStats(req.user!.clinicId!, req.user!.id);
    res.status(200).json({ status: 'success', data: revenue });
});
