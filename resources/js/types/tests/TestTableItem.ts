export interface TestTableItem {
    id: number;
    link: string | null;
    title: string;
    description: string;
    is_public: boolean;
    attempts: number;
    count_finished: number;
}
