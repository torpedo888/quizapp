import { Option } from '../_models/Option';

export interface Question {
    id: number;
    text: string;
    options: Option[];
    imageUrl: string;
    categoryName?: string;
  }