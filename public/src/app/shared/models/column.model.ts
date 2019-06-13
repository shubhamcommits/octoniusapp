export interface Data{
    title: string;
    taskCount: number;
}

export interface Column{
    _id: string;
    groupId: string;
    columns: Data[];
}