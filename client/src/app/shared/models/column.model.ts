export interface Data{
    title: string;
    taskCount: number;
}

export interface Column{
    _id: string;
    groupId: string;
    columns: Data[];
}

export class Column {
    constructor(public name: string, public tasks: string[]) {}
}