'use strict';

/* 
 * If u want to change the following settings, 
 * u'll need to remove and reinstall the extension to make it work. 
 */

/* Auto Level Selection */
export const ForceLowLevel = false;					// Default: false
export const IgnoreRaid = false;					// Default: false

/* Clean Items */
export const CleanDuplicatedRareItems = true;		// Default: false
export const CleanDuplicatedEpicItems = true;		// Default: false
export const CleanDuplicatedLegendaryItems = true;	// Default: false
export const DiscardAllCommonUncommonItems = true;	// Default: false (only works when user level >= 14)
export const EnableAutoClean = true;				// Default: true

export const NumNewItemsToAutoClean = 20;			// Default: 20
export const CleanItemsLimit = 100;					// Default: 100

/* Devs only, leave this alone */
export const DebugMode = true;						// Default: false