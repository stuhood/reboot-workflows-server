import { ReaderContext, WriterContext, WorkflowContext, atLeastOnce } from "@reboot-dev/reboot";

import {
  Workflow,
  WorkflowStatus,
  CreateAndRunRequest,
  StatusRequest,
  RunRequest,
} from "../../api/workflows/v1/workflows_rbt.js";

export class WorkflowServicer extends Workflow.Servicer {
  async createAndRun(
    context: WriterContext,
    state: Workflow.State,
    request: CreateAndRunRequest
  ) {
    // Spawn the workflow as a Task: https://docs.reboot.dev/develop/tasks/
    const task = await this.lookup().schedule({ when: new Date(0) }).run(context, {});

    // Initialize the state of the workflow.
    state.jsCode = request.jsCode.split(/\r?\n/);
    state.status = WorkflowStatus.RUNNING;
    state.taskId = task.taskId;

    // Return the response.
    return { taskId: task.taskId };
  }

  async status(
    context: ReaderContext,
    state: Workflow.State,
    request: StatusRequest
  ) {
    return { status: state.status };
  }

  async run(
    context: WorkflowContext,
    request: RunRequest
  ) {
    // Our implementation of workflows is to log each line of our own "code",
    // while sleeping between lines. We cancel ourselves if we encounter the
    // line "CANCEL".
    
    const { jsCode } = await this.state.read(context);

    for (let index = 0; index < jsCode.length; index++) {
      const line = jsCode[index];
      // If we encounter a line indicating that we should cancel, then exit the workflow.
      if (line === "CANCELLED") {
        await this.state.write("cancel", context, async (state) => {
          state.status = WorkflowStatus.CANCELLED;
        });
        return {};
      }

      // Otherwise, "execute" the step of the workflow.
      //
      // Note that the semantics of Reboot's workflows require idempotency, which
      // means that we must either execute a step exactly once, or at least once.
      // You would likely want to decompose the user's workflow into steps that
      // you executed, rather than just accepting a blob of code.
      await atLeastOnce(`execute step ${index}`, context, async () => {
        // Sleep 500 ms to pretend we're executing work.
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log(`Workflow ${context.stateId}: Step ${index} is done!`);
      });
    }

    await this.state.write("complete", context, async (state) => {
      state.status = WorkflowStatus.COMPLETED;
    });
    return {};
  }
}
