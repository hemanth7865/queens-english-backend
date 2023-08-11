import { getManager, getRepository, Like } from "typeorm";
import { Admin } from "../entity/Admin";
import { CSVUpload } from "../entity/CSVUpload";
import { School } from "../entity/School";

export class CSVUploadService {
  private csvUploadRepository = getRepository(CSVUpload);
  private schoolRepository = getRepository(School);
  private adminRepository = getRepository(Admin);

  CSVUploadService() {}

  async createCsvUploadRecord(
    data: {
      id?: string;
      schoolId?: string;
      fileName?: string;
      uploadType?: string;
      errors?: any[];
    },
    userId: string
  ) {
    const { id, schoolId, fileName, uploadType, errors } = data;
    let csvUploadDetails;
    if (id) {
      csvUploadDetails = await this.csvUploadRepository.findOne({ id: id });
    } else {
      csvUploadDetails = new CSVUpload();
      csvUploadDetails.uploadedAt = new Date();
    }
    csvUploadDetails.schoolId = schoolId;
    csvUploadDetails.uploadType = uploadType;
    csvUploadDetails.fileName = fileName;
    csvUploadDetails.errors = errors ? JSON.stringify(errors) : null;
    csvUploadDetails.uploadedBy = userId;

    const response = await this.csvUploadRepository.save(csvUploadDetails);
    return response;
  }

  async getCSVUploads(parameters: {
    current?: string;
    pageSize?: string;
    uploadedAt?: string;
    schoolName?: string;
    uploadedBy?: string;
    uploadType?: string;
  }) {
    var current = parseInt(parameters.current) || 0;
    var pageSize = parseInt(parameters.pageSize) || 20;

    var offset = parseInt(parameters.current);
    var current = offset;

    if (offset > 0) {
      offset = offset - 1;
    }

    let query_list = [];
    let query_string = "";

    const uploadedAt = parameters.uploadedAt;
    if (uploadedAt) {
      query_list.push(`cud.uploadedAt like  '%${uploadedAt}%' `);
    }

    if (parameters.schoolName) {
      query_list.push(` school.schoolName LIKE '%${parameters.schoolName}%' `);
    }

    if (parameters.uploadedBy) {
      query_list.push(
        ` CONCAT(admin.firstname,' ',admin.lastname) LIKE '%${parameters.uploadedBy}%' `
      );
    }

    if (parameters.uploadType) {
      query_list.push(` cud.uploadType =  '${parameters.uploadType}' `);
    }

    if (query_list.length > 0) {
      query_string = " where ";
    }

    query_list.forEach((value, index) => {
      if (index != query_list.length - 1) {
        query_string = query_string + query_list[index] + " and ";
      } else {
        query_string = query_string + query_list[index];
      }
    });
    var query = `select cud.*, school.schoolName, CONCAT(admin.firstname, " ", admin.lastname) as uploadedByName from 
    csv_upload_details as cud LEFT JOIN school on school.id = cud.schoolId LEFT JOIN admin on admin.id = cud.uploadedBy ${query_string} ORDER BY cud.uploadedAt DESC LIMIT ${
      pageSize >= 0 ? pageSize : 20
    } OFFSET ${(offset >= 0 ? offset : 0) * (pageSize >= 0 ? pageSize : 20)};`;

    console.log("QUERY", query);

    var results = await getManager().query(query);
    const count = await getManager().query(`select count(*) as total from 
      csv_upload_details as cud LEFT JOIN school on school.id = cud.schoolId LEFT JOIN admin on admin.id = cud.uploadedBy ${query_string};`);

    return {
      success: true,
      data: results,
      total: parseInt(count[0]?.total),
      current: current,
      pageSize: pageSize,
    };
  }
}
