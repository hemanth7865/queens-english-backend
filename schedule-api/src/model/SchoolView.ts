import { SRA } from "../entity/SRA";
import { Classes } from "../entity/Classes";

export class SchoolView {
    id: string;
    schoolName?: string;
    schoolCode: string;
    poc?: string;
    sraName?: string;
    sra?: SRA;
    classes?: Classes[];
    classesData?: any[];
    createdAt?: Date | string;
    schoolStatus?: string;
    numberOfBatches?: number;
    location?: string;

    public constructor(id: string, schoolName?: string, schoolCode?: string, poc?: string, sraName?: string, sra?: SRA, classes?: Classes[], classesData?: any[], createdAt?: Date | string, schoolStatus?: string, numberOfBatches?: number, location?: string) {
        this.id = id;
        this.schoolName = schoolName;
        this.schoolCode = schoolCode;
        this.poc = poc;
        this.sraName = sraName;
        this.sra = sra;
        this.classes = classes;
        this.classesData = classesData;
        this.createdAt = createdAt;
        this.schoolStatus = schoolStatus;
        this.numberOfBatches = numberOfBatches;
        this.location = location;
    }

}