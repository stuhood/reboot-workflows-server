import { Application, ExternalContext } from "@reboot-dev/reboot";
import { Workflow } from "../../api/workflows/v1/workflows_rbt.js";
import { WorkflowServicer } from "./workflow_servicer.js";

new Application({
  servicers: [WorkflowServicer],
}).run();
