import { notification } from 'antd';

export const openNotificationWithIcon = (type: string, message: string , reload = true) => {
    notification[type]({
      message,
      description: '',
    });
    if(reload){
        setTimeout(() => {
            window.location.reload()
          }, 2000);
    }
};

export const APIResponseHandler = (msg: any, success: string, failed: string) => {
    if (msg.status === 400) {
        if(Array.isArray(msg.errors)){
            for(let m of msg.errors){
                openNotificationWithIcon('error', m, false);
            }
        }else{
            openNotificationWithIcon('error', failed, false);
        }
    } else {
        console.log(msg);
        openNotificationWithIcon('success', success);
    }
}