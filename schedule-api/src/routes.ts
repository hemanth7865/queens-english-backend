import { LoginController } from "./controller/LoginController";
import {UserController} from "./controller/UserController";
import { BatchController} from "./controller/BatchController";

export const Routes = [
    {
        method: "post",
        route: "/login",
        controller: LoginController,
        action: "login"
    },
    {
        method: "get",
        route: "/currentUser",
        controller: LoginController,
        action: "currentUser"
    },
    {
    method: "get",
    route: "/leads",
    controller: UserController,
    action: "allLeads"
},

{
    method: "get",
    route: "/leadsView",
    controller: UserController,
    action: "listLeadDetails"
}, {
    method: "get",
    route: "/leadsFullView/:id",
    controller: UserController,
    action: "leadFullDetails"
},
{
    method: "post",
    route: "/leads",
    controller: UserController,
    action: "saveLeads"
}, {
    method: "get",
    route: "/filterLead",
    controller: UserController,
    action: "filterLeadDetails"
}, {
    method: "delete",
    route: "/users/:id",
    controller: UserController,
    action: "remove"
},
{
    method: "post",
    route: "/batch",
    controller: BatchController,
    action: "batchCreate"
},
{
    method: "get",
    route: "/listbatch",
    controller: BatchController,
    action: "getBatches"
},
{
    method: "get",
    route: "/listclass",
    controller: BatchController,
    action: "getClasses"
}];