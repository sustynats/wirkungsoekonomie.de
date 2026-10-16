import {importV9,V9} from './v9-store.mjs';
const store=importV9(process.argv[2],process.argv[3]||V9);console.log(JSON.stringify({cards:Object.values(store.objects).filter(o=>o.type==='wirkungskarte').length,families:20,dossiers:21,public:0,approvals:0}));
