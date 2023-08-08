import { getConnection, getRepository } from "typeorm";
import { CSVUpload } from "../entity/CSVUpload";

export class CSVUploadService {
  private csvUploadRepository = getRepository(CSVUpload);

  CSVUploadService() {}

  async createCsvUploadRecord(
    data: {
      id?: string;
      schoolId?: string;
      fileName?: string;
      errors?: any[];
    },
    userId: string
  ) {
    const { id, schoolId, fileName, errors } = data;
    let csvUploadDetails;
    if (id) {
      csvUploadDetails = await this.csvUploadRepository.findOne({ id: id });
    } else {
      csvUploadDetails = new CSVUpload();
      csvUploadDetails.uploadedAt = new Date();
    }
    csvUploadDetails.schoolId = schoolId;
    csvUploadDetails.fileName = fileName;
    csvUploadDetails.errors = errors ? JSON.stringify(errors) : null;
    csvUploadDetails.uploadedBy = userId;

    const response = await this.csvUploadRepository.save(csvUploadDetails);
    return response;
  }
}
