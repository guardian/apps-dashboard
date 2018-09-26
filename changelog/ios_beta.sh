#!/bin/bash -x

# Version in app store
#PREVIOUS=$(git tag | grep '7\..$' | sort -rn | head -1)
#CURRENT=$(git tag | sort -rn | head -1)

# Latest uploaded beta
PREVIOUS=$(git tag | sort -rn | head -1)
CURRENT=master

git log --pretty=oneline --abbrev-commit ${PREVIOUS}..${CURRENT} > git_history.txt

grep -o '#....)$' git_history.txt | grep -o '[0-9][0-9][0-9][0-9]' | xargs -I {} curl --silent --user "${GITHUB_CREDENTIALS}" https://api.github.com/repos/guardian/ios-live/pulls/{} | jq -r '.title + " <a href=\"" + ._links.html.href + "\">(#" + (.number|tostring) + ")</a><br>"' > pr_subjects.txt

grep mobile-apps-article-templates git_history.txt | cut -d'@' -f2 | xargs -I {} curl --silent --user "${GITHUB_CREDENTIALS}" https://api.github.com/repos/guardian/mobile-apps-article-templates/git/refs/tags/{} | jq -r '.object.url' | xargs curl --user "${GITHUB_CREDENTIALS}" --silent | jq -r '.object.url' | xargs curl --user "${GITHUB_CREDENTIALS}" --silent | jq '.message' | grep -o '#...' | grep -o '[0-9][0-9][0-9]' | xargs -I {} curl --silent --user "${GITHUB_CREDENTIALS}" https://api.github.com/repos/guardian/mobile-apps-article-templates/pulls/{} | jq -r '.title + " <a href=\"" + ._links.html.href + "\">(#" + (.number|tostring) + ")</a><br>"' > templates.txt

grep -o GLA-[0-9][0-9][0-9] git_history.txt | xargs -I{} curl -s -u ${JIRA_CREDENTIALS} https://theguardian.atlassian.net/rest/api/latest/issue/{} | jq -r '.key + "+" + .fields.issuetype.name + "+" + .fields.resolution.name + "+" + .fields.summary + " <a href=\"https://theguardian.atlassian.net/browse/" + .key + "\">(" + .key + ")</a><br>"' > jira_tickets.txt

grep -v +Done+ jira_tickets.txt | cut -d'+' -f1 > jira_in_progress.txt
grep -F -f jira_in_progress.txt pr_subjects.txt > wip_prs.txt

cat > index.html <<EOF
<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">

    <title>Release notes</title>
  </head>
  <body>
<main role="main" class="container">
      <h3 class="mt-5">Changes since ${PREVIOUS}</h3>
<p>
  <a class="btn btn-light" data-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
    Raw git diff
  </a>
</p>
<div class="collapse" id="collapseExample">
  <div class="card card-body">
    <pre>$(cat git_history.txt)</pre>
  </div>
</div>
      <p class="lead">Stories</p>
      <p>$(grep Story+Done+ jira_tickets.txt | cut -d+ -f4)</p>
      <p class="lead">Bugs</p>
      <p>$(grep Bug+Done+ jira_tickets.txt | cut -d+ -f4)</p>
      <p class="lead">Pull Requests</p>
      <p>$(grep -v GLA- pr_subjects.txt)
         $(cat wip_prs.txt)</p>
      <p class="lead">Templates changes</p>
      <p>$(cat templates.txt)</p>
    </main>

    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
  </body>
</html>
EOF
