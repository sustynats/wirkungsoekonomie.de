alter table parliament.political_source_documents
  add column if not exists download_asset_url text;

update parliament.political_source_documents set download_asset_url = case source_key
  when 'btw-2025-cdu-csu' then 'https://www.cdu.de/app/uploads/2025/01/km_btw_2025_wahlprogramm_langfassung_ansicht.pdf'
  when 'btw-2025-spd' then 'https://www.spd.de/fileadmin/Dokumente/Beschluesse/Programm/2025_SPD_Regierungsprogramm.pdf'
  when 'btw-2025-gruene' then 'https://cms.gruene.de/uploads/assets/20250318_Regierungsprogramm_DIGITAL_DINA5.pdf'
  when 'btw-2025-afd' then 'https://www.afd.de/wp-content/uploads/2025/02/AfD_Bundestagswahlprogramm2025_web.pdf'
  when 'btw-2025-linke' then 'https://www.die-linke.de/fileadmin/user_upload/Wahlprogramm_Langfassung_Linke-BTW25_01.pdf'
  when 'btw-2025-ssw' then 'https://www.ssw.de/fileadmin/user_upload/daten/aktuelles/2025/BTW25/SSW-Wahlprogramm_BTW_2025.pdf'
  when 'coalition-2025-cdu-csu-spd' then 'https://www.koalitionsvertrag2025.de/sites/www.koalitionsvertrag2025.de/files/koav_2025.pdf'
  else download_asset_url
end
where source_key in ('btw-2025-cdu-csu', 'btw-2025-spd', 'btw-2025-gruene', 'btw-2025-afd', 'btw-2025-linke', 'btw-2025-ssw', 'coalition-2025-cdu-csu-spd');
