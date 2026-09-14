export const preparedNewsStory = () => ({
  story_id:'test-news', canonical_title:'Stadt erneuert Wasserleitungen',
  sources:[{source_id:'city',title:'Stadt erneuert Wasserleitungen',url:'https://example.org/wasser',published_at:'2026-09-13T09:30:00Z',
    evidence_segments:[{evidence_id:'e0_0',excerpt:'Die Stadt kündigt die Erneuerung der Wasserleitungen im kommenden Jahr an. Die Arbeiten beginnen zunächst im Norden und sollen nach Angaben der Verwaltung die Versorgung zuverlässiger machen.'}]}],
  claims:[{claim_id:'c1',source_id:'city',claim:'Die Stadt kündigt die Erneuerung der Wasserleitungen an.'}],
});
export const preparedNewsPrompt = (story=preparedNewsStory()) => 'Native analysis contract and original evidence.\nUNTRUSTED_SOURCE_DATA_BEGIN\n'+JSON.stringify([story])+'\nUNTRUSTED_SOURCE_DATA_END';
