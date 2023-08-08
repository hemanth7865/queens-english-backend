import { Entity, PrimaryGeneratedColumn, BaseEntity, Column } from "typeorm";

@Entity("csv_upload_details")
export class CSVUpload extends BaseEntity {
  CSVUpload() {}
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true, type: "text" })
  schoolId: string;

  @Column({ nullable: true, type: "text" })
  fileName: string;

  @Column({ nullable: true, type: "text" })
  errors: string;

  @Column({ nullable: true, type: "text" })
  uploadedBy: string;

  @Column({ nullable: true, type: "datetime" })
  uploadedAt: Date;
}
