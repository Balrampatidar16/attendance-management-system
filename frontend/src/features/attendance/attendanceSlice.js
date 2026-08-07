import { createSlice } from '@reduxjs/toolkit';

// UI-only state (list filters), kept in Redux so they survive navigating away from and back to
// the My Attendance page within the same session — not server data, so it lives outside RTK Query.
const initialState = {
  myFilters: {
    startDate: '',
    endDate: '',
    workStatus: '',
    page: 1,
  },
};

const attendanceSlice = createSlice({
  name: 'attendanceUi',
  initialState,
  reducers: {
    setMyFilters: (state, action) => {
      state.myFilters = { ...state.myFilters, ...action.payload };
    },
    resetMyFilters: (state) => {
      state.myFilters = initialState.myFilters;
    },
  },
});

export const { setMyFilters, resetMyFilters } = attendanceSlice.actions;
export default attendanceSlice.reducer;

export const selectMyAttendanceFilters = (state) => state.attendanceUi.myFilters;
