<template>
  <section class="job-section">
    <header class="job-header" v-if="title || hasControls">
      <div class="title-block">
        <h2 v-if="title">{{ title }}</h2>
        <slot name="subtitle"></slot>
      </div>
      <div class="controls" v-if="hasControls">
        <slot name="filters"></slot>
        <button
          v-if="allowFlip"
          type="button"
          class="sort-toggle"
          @click="$emit('update:direction', direction === 'asc' ? 'desc' : 'asc')"
        >
          <span class="material-symbols-rounded" aria-hidden="true">{{ direction === 'asc' ? 'south' : 'north' }}</span>
          {{ direction === 'asc' ? 'Oldest first' : 'Newest first' }}
        </button>
      </div>
    </header>

    <div v-if="loading" class="job-list">
      <JobSkeleton v-for="n in 3" :key="n" />
    </div>

    <div v-else-if="!grouped" class="flat-list">
      <div v-if="!jobs || jobs.length === 0" class="empty-state">
        <slot name="empty">
          <BaseEmptyState 
            title="No jobs found" 
            description="There are no active jobs at the moment."
            icon="work_off"
          />
        </slot>
      </div>

      <ul v-else class="job-list">
        <li v-for="job in jobs" :key="job.id">
          <JobListItem
            :job="job"
            :role="role"
            @action="(action) => $emit('action', { job, action })"
          />
        </li>
      </ul>
    </div>

    <div v-else class="grouped-list">
      <template v-for="group in orderedGroups" :key="group.key">
        <section v-if="group.jobs.length" class="group-block">
          <div class="group-header">
            <h3>{{ group.label }}</h3>
            <span>{{ group.jobs.length }} jobs</span>
          </div>
          <ul class="job-list">
            <li v-for="job in group.jobs" :key="job.id">
              <JobListItem
                :job="job"
                :role="role"
                @action="(action) => $emit('action', { job, action })"
              />
            </li>
          </ul>
        </section>
      </template>

      <div v-if="!hasJobs" class="empty-state">
        <slot name="empty">
          <BaseEmptyState 
            title="No jobs found" 
            description="There are no active jobs in this view."
            icon="filter_list_off"
          />
        </slot>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, useSlots } from 'vue' // Ensuring useSlots is imported
import JobListItem from './JobListItem.vue'
import JobSkeleton from './JobSkeleton.vue'
import BaseEmptyState from '@/components/ui/BaseEmptyState.vue'

const slots = useSlots()

const props = defineProps({
  jobs: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: 'client'
  },
  grouped: {
    type: Boolean,
    default: false
  },
  direction: {
    type: String,
    default: 'asc'
  },
  allowFlip: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['action', 'update:direction'])

const hasControls = computed(() => props.allowFlip || !!slots.filters)

const orderedGroups = computed(() => {
  if (!props.grouped) return []
  if (props.jobs.length && props.jobs[0]?.__group) {
    return [
      { key: 'today', label: 'Today', jobs: props.jobs.filter(job => job.__group === 'today') },
      { key: 'last7', label: 'Last 7 Days', jobs: props.jobs.filter(job => job.__group === 'last7') },
      { key: 'older', label: 'Earlier', jobs: props.jobs.filter(job => job.__group === 'older') }
    ]
  }
  return props.jobs
})
const hasJobs = computed(() => orderedGroups.value.some(group => group.jobs?.length))
</script>

<style scoped>
.job-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.sort-toggle {
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 0.35rem 0.85rem;
  background: #fff;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
  color: #475569;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.job-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

  /* Empty state styles handled by component */

</style>
