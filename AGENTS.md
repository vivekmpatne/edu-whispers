<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## ExplainEdu (imported from github.com/vivekmpatne/ExplainEdu)
- The original Express API lives in `src/routes/api/$.ts` at the same `/api/*` paths, so screens keep their original calls.
- The Python ML service is ported to `src/server/explainedu/ml.ts`, which runs the RandomForest trained with the repo's own scripts and exported to `model.json`, because Python can't run on the Worker runtime.
- The in-memory store (`src/server/explainedu/store.ts`) mirrors the original demo and isn't persistent, to keep the source's behavior for testing.
