# TODO

1. Replace mock job data with realtime database queries per role using `useJobStore` + `userRepository`.
2. Persist technician onboarding submissions (documents) to Firebase storage / database; wire admin approval updates back to technician records (`status = approved`).
3. Implement admin approval workflow (approve / reject) to update realtime database and send notifications.
4. Gate `/tech-onboarding` route for only pending techs; redirect approved techs to `/technician/home`.
5. Ensure job actions (accept/start/complete) call backend endpoints and update realtime job state.
6. Add global loading/error handling for auth flows (spinners, retry) to improve UX.
7. Tighten router guard logging / telemetry for debugging unexpected redirects.

