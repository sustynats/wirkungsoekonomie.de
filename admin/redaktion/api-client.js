// Read failures are retryable. Mutations keep their longer deadline and are
// never retried automatically: a timed-out decision may already be saved.
export async function editorialRequest(base,path,token,options={},fetcher=fetch){
  if(!token)throw Error('Bitte melde Dich mit Deinem Discord-Konto an.');
  const read=!options.method||options.method==='GET';
  const headers={Authorization:`Bearer ${token}`,...options.headers};
  if(options.body&&typeof options.body==='string')headers['Content-Type']='application/json';
  try{
    const response=await fetcher(base+path,{...options,headers,credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(read?15000:90000)});
    const data=await response.json().catch(()=>({error:'Der Server hat keine lesbare Antwort geliefert. Bitte erneut versuchen.'}));
    if(!response.ok){
      const message=response.status===401||response.status===403
        ? 'Deine Anmeldung konnte nicht bestätigt werden. Bitte erneut mit Discord anmelden.'
        : data.error||'Der Redaktionsserver ist gerade nicht erreichbar. Bitte erneut versuchen.';
      const error=Error(message);error.status=response.status;throw error;
    }
    if(data.error)throw Error(data.error);
    return data;
  }catch(error){
    if(error.name==='TimeoutError'||error.name==='AbortError')throw Error(read
      ? 'Der Redaktionsserver antwortet gerade zu langsam. Deine Anmeldung wurde nicht gelöscht. Bitte erneut versuchen.'
      : 'Die Antwort dauert zu lange. Bitte zuerst den Bearbeitungsstand aktualisieren; die Aktion könnte bereits gespeichert sein.');
    if(error instanceof TypeError)throw Error('Der Redaktionsserver ist gerade nicht erreichbar. Bitte Verbindung prüfen und erneut versuchen.');
    throw error;
  }
}
