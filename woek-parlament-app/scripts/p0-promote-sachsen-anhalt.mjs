const expectedBranch = "p0/promote-sachsen-anhalt-20260819";
const projectId = "prj_h1X7GuXOVo1bdnOfoYXzTfP8ygBK";
const deploymentId = "dpl_97u3zvKqcswrtowjLjAicoEmHqX1";
const teamId = "team_sOR1voJPyc1jY5VsMdQRyFWz";

if (process.env.VERCEL !== "1") {
  console.log("WOEK_P0_PROMOTE_SKIP_NOT_VERCEL");
  process.exit(0);
}

if (process.env.VERCEL_ENV !== "preview") {
  console.log("WOEK_P0_PROMOTE_SKIP_NON_PREVIEW", process.env.VERCEL_ENV ?? "unset");
  process.exit(0);
}

if (process.env.VERCEL_GIT_COMMIT_REF !== expectedBranch) {
  console.log("WOEK_P0_PROMOTE_SKIP_WRONG_BRANCH", process.env.VERCEL_GIT_COMMIT_REF ?? "unset");
  process.exit(0);
}

const token = process.env.VERCEL_OIDC_TOKEN;
if (!token) {
  throw new Error("WOEK_P0_PROMOTE_OIDC_TOKEN_MISSING");
}

const endpoint = `https://api.vercel.com/v10/projects/${projectId}/promote/${deploymentId}?teamId=${teamId}`;
const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});
const body = await response.text();
console.log("WOEK_P0_PROMOTE_HTTP", response.status, body.slice(0, 1000));
if (!response.ok) {
  throw new Error(`WOEK_P0_PROMOTE_FAILED_${response.status}`);
}
console.log("WOEK_P0_PROMOTE_REQUEST_ACCEPTED", deploymentId);
