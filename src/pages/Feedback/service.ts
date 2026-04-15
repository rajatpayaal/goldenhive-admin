import { deleteFeedbackById, listFeedbackByPackage } from '../../services/adminPanel.service'

export const getFeedbackByPackage = (packageId: string, params?: Record<string, unknown>) =>
  listFeedbackByPackage(packageId, params)

export const removeFeedback = (id: string) => deleteFeedbackById(id)
