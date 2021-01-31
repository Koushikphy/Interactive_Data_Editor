## *v2.9.2
1. Use a single instance of the software.
2. If viewer/spreadsheet window is open when clicking the viewer menu button it will just focus it instead of opening a new windo.
3. New plot dashboard style to quickly change column directly from the dashboard
4. Improved data communication between main and viewerwindow.

## v2.9.1
1. Added multiplot surface plot option for the 3D viewer.
1. Ranged selector, select intermediate points that are out of the view.
2. Fixed several bugs.


## v2.9.0
### NEW:
1. Directly load multiple files.
3. List of plot is moved to a sidebar instead of the popup window.
5. Lock axes when working with multiple files.
7. Save fitted data.
9. `Fill values` can now take number of gird or grid spacing

### Fixed:
2. Fixed bug with loading file directly from terminal.
4. Fixed bug in undo.
6. Fixed bug with swapper when working with multiple files.
8. Fixed bug with 3D viewer not updating


## v2.8.0
1. UI changes.
2. doc style changes
3. Plot setting window
4. Plot list utility
5. Mouse Scroll support for slider and column selector
6. Coulumn selector from 3D Viewer window
7. Improved performance
8. Minor bug fixes
9. Improved 3D plotter  
10. Axes range bug in 3D plotter


## 2.7.0
#### NEW:
1. Fit any function to data points with Levenberg-Marquardt algorithm
2. Interactive regression fitting
3. Save images in pdf.
4. Spreadsheet now support excel formula.

#### FIXED:
1. Problem with filling missing for 1D data.
2. Bug with 3D plotter
2. Improved loading time and minor bug fixes. 


## 2.6.0
#### NEW:
1. New & Improved 3D plotter with multiple surfaces and basic plot configuration support.
2. Improved plot settings.
3. Save image in four file formats and desired resolution
4. A new right click context menu to quickly access features.
5. Delete bad data points.

#### FIXED:
1. Wrong legend number.
2. Performance improvements.





## 2.5.0

#### NEW:
1. Now supports editing data from __multiple files or multiple column__ of same files simultaneously.
2. __Plot configuration__ : configure your plot any way you like.
3. Added support for __LaTeX__ rendering
4. Now __Drag & Drop__ files to open them.
5. Open software and load file directly from terminal.
6. New method to extrapolate and smooth out using a quadratic function.
6. New notification style.

#### FIXED: 
1. Problem when working with files having windows style line ending (CRLF).



## 2.3.0
#### NEW:
1. Warning on quit with unsaved data.
2. Dragging selected points now can also be done with Up/Down arrow keys of keyboard, along with mouse.
3. Undo/Redo support is increased up-to 10 steps. 
4. Different keyboard shortcuts are assigned for undo/redo.
5. Copy & Paste X or Y value.
6. Ask for file filename for first time saving.
7. New and improved documentation.

#### FIXED:
1. Wrong result on repeat/mirror.
2. Dragging not working after mirror/repeat. 
3. Plotting along X axis doesn't work properly with missing data.
4. Dragging doesn't work properly when swapper is open.
5. Loading file for compare doesn't work properly .
6. Menu from all windows except the main window is removed.
7. 3D viewer doesn't open on full screen sometimes.
8. Problem with moving average smoothing on endpoints data.
9. 3D viewer not updating after using Moving Average.
10. 'Plot along' layout changed.
11. 3D viewer not updating after swap.
12. File opener location getting reset.
13. 3D viewer changing with 'Plot along'
14. Keybindings doesn't work when caps lock is on.
15. Wrongly saving data when plotted along 'Y'
And several minor bug fixes and improves...


## 2.1.0
Several UI changes and a new layout with a lot of new & useful features. 
#### NEW: 
1. Fill Missing Data.
2. Extend Data by repeating or mirroring any number of times
3. Filter data i.e replace values subject to a given condition.
4. Open last 10 recently use files, directly from the menu.
5. The File open/save dialog now remembers and opens at the last used folder location.
6. 3D Plot viewers now can handle unequal or missing data.


## 1.3.0
#### New:
1. Now this software will notify you if there's a new version available.

#### Fixed:
1. Now only horaizontal selection is allowed in swapper, also box zoom can be used.
2. Some points were not draggable.
