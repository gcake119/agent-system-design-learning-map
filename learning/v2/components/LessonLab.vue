<script setup>
import {computed} from 'vue';import {labFor} from '../sim/lesson-labs.mjs';
import RequirementSimulator from './RequirementSimulator.vue';import BoundarySimulator from './BoundarySimulator.vue';import ConcurrencySimulator from './ConcurrencySimulator.vue';import QueueSimulator from './QueueSimulator.vue';import FailureSimulator from './FailureSimulator.vue';import EvidenceSimulator from './EvidenceSimulator.vue';import CapacitySimulator from './CapacitySimulator.vue';import RolloutSimulator from './RolloutSimulator.vue';
const props=defineProps({unitId:String,stageId:String});const lab=computed(()=>labFor(props.unitId,props.stageId));
const components={requirements:RequirementSimulator,boundary:BoundarySimulator,concurrency:ConcurrencySimulator,queue:QueueSimulator,failure:FailureSimulator,evidence:EvidenceSimulator,capacity:CapacitySimulator,rollout:RolloutSimulator};
const active=computed(()=>lab.value?components[lab.value.component]:null);
</script><template><div v-if="lab&&active" class="lesson-lab-host"><div class="lesson-lab-guide"><span>這一段先觀察</span><p>{{lab.note}}</p></div><component :is="active" :focus="lab.focus" /></div></template>