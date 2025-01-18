
# User specified workflows server

1. Install the app.
```console
npm install
```
2. Run the app in one terminal, and leave it running.
```console
npx rbt dev run
```
3. Open http://127.0.0.1:9991/__/inspect in a browser.
4. In a separate terminal, create a workflow named "my-workflow".
```console
curl -XPOST http://localhost:9991/workflows.v1.WorkflowMethods/CreateAndRun \
  -H "x-reboot-state-ref:workflows.v1.Workflow:my-workflow" \
  -d '{ "js_code": "this is\nmy code\nit is\nlong enough\nto take\na few seconds\ntorun" }'
```
5. Inspect the workflow's running task.
```console
npx rbt task list --application-url=http://127.0.0.1:9991
```
6. Look at the status of the workflow until you see it complete.
```console
curl -XPOST http://localhost:9991/workflows.v1.WorkflowMethods/Status \
  -H "x-reboot-state-ref:workflows.v1.Workflow:my-workflow"
```
