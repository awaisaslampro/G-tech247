export type ApplicationRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string | null;
  years_of_experience: number | null;
  country_covered: string | null;
  cities_covered: string[] | null;
  position: string;
  cover_letter: string | null;
  cv_path: string;
  cv_file_name: string;
  identity_document_path: string | null;
  identity_document_file_name: string | null;
  created_at: string;
};
