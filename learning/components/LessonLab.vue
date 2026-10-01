<script setup>
import FlowInvestigationLab from './FlowInvestigationLab.vue';
defineProps({unitId:String,stageId:String,prompt:String});
</script>
<template><FlowInvestigationLab :unit-id="unitId" :stage-id="stageId" :prompt="prompt" /></template>
