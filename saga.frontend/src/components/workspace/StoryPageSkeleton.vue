<script setup lang="ts">
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
</script>

<template>
  <Card>
    <CardHeader class="flex-row items-center space-y-0 pb-3">
      <div class="flex items-center gap-3">
        <!-- Page number placeholder -->
        <div class="h-8 w-8 animate-pulse rounded-full bg-muted" />
        <!-- Badge placeholder -->
        <div class="h-5 w-16 animate-pulse rounded-full bg-muted" />
      </div>
    </CardHeader>

    <Separator />

    <CardContent class="pt-4">
      <!-- Beat note placeholder -->
      <div class="mb-4 h-6 w-3/4 animate-pulse rounded-md bg-muted" />

      <!-- Paragraph skeletons - mimics prose layout -->
      <div class="space-y-4">
        <div class="space-y-2">
          <div class="h-4 w-full animate-pulse rounded bg-muted" />
          <div class="h-4 w-full animate-pulse rounded bg-muted" />
          <div class="h-4 w-11/12 animate-pulse rounded bg-muted" />
        </div>

        <div class="space-y-2">
          <div class="h-4 w-full animate-pulse rounded bg-muted" />
          <div class="h-4 w-full animate-pulse rounded bg-muted" />
          <div class="h-4 w-10/12 animate-pulse rounded bg-muted" />
          <div class="h-4 w-9/12 animate-pulse rounded bg-muted" />
        </div>

        <div class="space-y-2">
          <div class="h-4 w-full animate-pulse rounded bg-muted" />
          <div class="h-4 w-full animate-pulse rounded bg-muted" />
          <div class="h-4 w-8/12 animate-pulse rounded bg-muted" />
        </div>

        <div class="space-y-2">
          <div class="h-4 w-full animate-pulse rounded bg-muted" />
          <div class="h-4 w-full animate-pulse rounded bg-muted" />
          <div class="h-4 w-10/12 animate-pulse rounded bg-muted" />
          <div class="h-4 w-7/12 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>
