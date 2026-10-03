# Phase 5: Templates

Templates are page shells made of library instances, with an empty content area.

1. Create a `Slot/Content` component: a frame with a dashed border, a centred "Content" label, and fill-container sizing.
2. Build one template per layout family seen in the source. For example:
   - **Dashboard:** Top Bar, sidebar (Workspace Switcher, Nav Section Headers, Nav Items, Sidebar Footer), Slot.
   - **Settings:** Top Bar, settings sidebar, a centred column of Settings Rows and a Slot.
   - **CMS / Table:** sidebar, toolbar, Table Header and Table Cell grid, Slot.
   - **Canvas / Editor:** Top Bar, left layers panel, canvas Slot, right inspector, Breakpoint Bar.
   - **Auth:** a centred card with buttons (Inverse "Continue with Google", Secondary) and a labelled Divider. Make Light and Dark copies using `explicitVariableModes`.
3. Templates use auto-layout from top to bottom. Columns use fill sizing, so resizing the frame works.
4. Check: duplicate a template, drop content in, and compare with the source frame.
