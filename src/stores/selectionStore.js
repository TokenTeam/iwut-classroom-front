import { defineStore } from 'pinia'

export const useSelectionStore = defineStore('selections', {
  state: () => ({
    campus: '0101',
    time: '1',
    section: '13',
    availableBuildings: [],
    classroomData: {},
    isLoading: true
  }),
  actions: {
    updateSelections(payload) {
      this.campus = payload.campus
      this.time = payload.time
      this.section = payload.section
    },
    setAvailableBuildings(buildings) {
      this.availableBuildings = buildings;
    },
    setClassroomData(data) {
      this.classroomData = data;
    }
  }
})

