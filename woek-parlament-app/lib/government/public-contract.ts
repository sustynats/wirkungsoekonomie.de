export type GovernmentActionIndexEntry = {
  id: string;
  title: string;
  actionType: string;
  responsibleInstitutions: string[];
  decisionDate: string | null;
  lifecycleStatus: string;
  coverageScopeStatus: string;
  haystack: string;
};
