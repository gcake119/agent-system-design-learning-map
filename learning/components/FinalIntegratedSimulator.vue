<script setup>
import {computed,ref} from 'vue';
import {finalTransfer} from '../final-transfer.mjs';
import FlowInvestigationLab from './FlowInvestigationLab.vue';
const props=defineProps({incidentId:String});
const lab=ref(null);
function restart(){lab.value?.reset();location.hash='#/final';}
defineExpose({restart});
const index=computed(()=>Math.max(0,finalTransfer.incidents.findIndex(i=>i.id===props.incidentId)));
</script>
<template><FlowInvestigationLab ref="lab" unit-id="redesign" stage-id="transfer" :incident-index="index" final prompt="先重建路徑、說明證據能支持什麼，再改一個條件。哪個結果改善了？新增什麼代價？如何重新驗證？" /></template>
