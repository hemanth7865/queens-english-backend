import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
    ManyToOne, OneToOne, JoinColumn, BaseEntity, OneToMany, PrimaryColumn} from "typeorm";
    
@Entity("lsq_users")
export class LSQUser extends BaseEntity {
    LSQUser() {}
    @PrimaryColumn("uuid")
        ID: string;
    @Column("text")
        FirstName: string;
    @Column("text")
        LastName: string;
    @Column("text")
        EmailAddress: string;
    @Column({'nullable':true})
        Role:string;
    @Column({'nullable':true})
        StatusCode: string;
    @Column({'nullable':true})
        Tag: string;
    @Column({'nullable':true})
        IsPhoneCallAgent: string;
    @Column({'nullable':true})
        alternativeMobile: string;       
}