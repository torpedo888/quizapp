import { Option } from '../_models/Option';

export interface Question {
    id: number;
    text: string;
    options: Option[];
    categoryName?: string;
  }