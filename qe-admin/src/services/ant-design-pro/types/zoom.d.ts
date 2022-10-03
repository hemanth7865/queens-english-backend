declare namespace Zoom {
  type ZoomUser = {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    zak_token: string;
    type: number;
    created_at: Date;
    updated_at: Date;
    /**
     * Relations
     */
    meetings?: ZoomMeeting[];
    user?: any;
  };

  type ZoomMeeting = {
    id: string;
    user_id: string;
    host_id: string;
    batch_id: string;
    uuid: string;
    meeting: string;
    start_url: string;
    join_url: string;
    password: string;
    created_at: Date;
    updated_at: Date;
    /**
     * Relations
     */
    zoom_user?: ZoomUser;
    batch: any;
  };

  type LinkType =
    | "GENERIC_STUDENT"
    | "GENERIC_TEACHER"
    | "PUBLIC_STUDENT"
    | "PUBLIC_TEACHER"
    | "GENERIC_UNIQUE_STUDENT";
}

export default Zoom;
