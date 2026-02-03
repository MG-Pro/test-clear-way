import { PageModel } from './page.model';

export interface DocumentModel {
  id: string;
  name: string;
  pages: PageModel[];
}
