**Date:** November 17, 2025

**Library:** AG Data Grid

---

## Requirements Status

### Embedded Field Expansion

| #   | Requirement                                                                                                                                                                                                                                    | Status                 | Note |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---- |
| #33 | Need to be able to expand embedded fields into columns with a single click                                                                                                                                                                     | ✅ **IMPLEMENTED**     |      |
| #34 | Any multi value fields inside the expanded columns should be further expand into vertical rows                                                                                                                                                 | ❌ **NOT IMPLEMENTED** |      |
| #35 | Multiple linked/related conversations would show as a single row with a +1 (+x) button. Clicking on that button would expand a single row into multiple rows. The common data (metadata) across them would be shown only once on the first row | ❌ **NOT IMPLEMENTED** |      |
| #36 | If owner, status, and due date are shown in a linked field/related conversation settings, we should also show them as separate columns in the expansion                                                                                        | ✅ **IMPLEMENTED**     |      |
| #37 | Expanded columns will have a common colour above the column headings to signify they are part of the same linked field/conv                                                                                                                    | ✅ **IMPLEMENTED**     |      |

### Data Management

| #   | Requirement                                                                                                          | Status | Note                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------- |
| #38 | Data in the embedded field should be editable in the same manner that they are editable elsewhere in the manage view | ⚠️     | Can be implemented in the original app with Redux state |
| #89 | Data in forms should be editable in the manage view                                                                  | ⚠️     | Can be implemented in the original app with Redux state |

### Filtering

| #   | Requirement                                                                                                                                                                                           | Status             | Remarks                                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------- |
| #39 | We should be able to filter by embedded field data in the same way as other data on the manage view. There are two types of filters - filter the linked field rows. Or filter all rows in the report. | ✅ **IMPLEMENTED** | Can be further refined to add different types of filters - text, number, picklist, date |
| #81 | Ability to filter linked field (or related conversation) records by any embedded field. i.e. it will not only filter the main process records but also the linked fields records                      | ✅ **IMPLEMENTED** |                                                                                         |
| #95 | We should add a “Me” filter to Owner, Participants, and User fields                                                                                                                                   | ⚠️                 | Can be implemented in the original with Redux state                                     |

### State Management

| #   | Requirement                                                                                                                          | Status                 | Note                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------ |
| #40 | We should be able to store the expansion state of the embedded fields in reports so that the user does not have to keep opening them | ❌ **NOT IMPLEMENTED** | Session-only state, resets on page reload, no localStorage/backend persistence |

### Display

| #   | Requirement                                                                                                                                                                                                | Status                 | Note                                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------- |
| #43 | If multiple embedded fields (from different linked / related conv) are expanded side by side and then multiple values are expanded vertically, there should be blank (grey) rows where there are no values | ❌ **NOT IMPLEMENTED** | Dependent on #34, vertical expansion not implemented |
| #90 | User should be able to change column width by dragging. Changes should be saveable in the report.                                                                                                          | ✅ **IMPLEMENTED**     |                                                      |

### File Management

| #   | Requirement                                                                        | Status | Remarks                                |
| --- | ---------------------------------------------------------------------------------- | ------ | -------------------------------------- |
| #93 | We should be able to preview files on the manage view using the hover preview menu | ⚠️     | Can be implemented in the original app |
| #94 | Generate PDF fields should show files on the manage view                           | ⚠️     | Can be implemented in the original app |

---

## Summary

**Total Requirements:** 15

- ✅ **Implemented:** 6 (40%)
- ❌ **Not Implemented:** 9 (60%)

### Implemented Features:

- Single-click embedded field expansion (#33)
- Dynamic nested columns with separate fields (#36)
- Color-coded column grouping (#37)
- Embedded field filtering (#39, #81)
- Column width resizing (#90)

### Not Implemented Features:

- Vertical row expansion for multi-value fields (#34)
- “+1” button for multiple linked records (#35)
- Data editing (#38, #89)
- “Me” filter for user fields (#95)
- Persistent state storage (#40)
- Blank row handling for multiple expansions (#43)
- File preview (#93)
- PDF file display (#94)

---
