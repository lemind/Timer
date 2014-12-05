$(function(){

	INTRO_STEPS = {
		indexSteps: [
	        {
	            element: 'input.task',
	            intro: 'This is input for name of your task'
	        },
	        {
	            element: '.select2.project-name',
	            intro: 'This is input for project name of your task'
	        },
	        {
	            element: '.btn.main',
	            intro: 'Main button. This one is start or stop timer of your task'
	        },
	        {
	            element: '.select2.tags-list',
	            intro: 'This is input for tags of your task'
	        },
	        {
	            element: '.task:first-child .desc',
	            intro: 'You can edit task name'
	        },
	        {
	            element: '.task:first-child .project',
	            intro: 'You can change project for your task'
	        },
	        {
	            element: '.task:first-child .tags',
	            intro: 'You can change tags for your task'
	        }
	    ],
		summaryReportSteps: [
	        {
	            element: '.filters .period',
	            intro: 'This is inputs for choose period of time'
	        },
	        {
	            element: '#summary-report-bar',
	            intro: 'This bar is showing how much time you spend for your period'
	        },
	        {
	            element: '.projects-detailed',
	            intro: 'This table is showing your time details by projects'
	        },
	        {
	            element: '.period-total-time',
	            intro: 'Total summ time of your period'
	        },
	        {
	            element: '.projects-detailed-drilldown-pie',
	            intro: 'This pie is showing details time by projects'
	        },
	        {
	            element: '.sum-time-tags',
	            intro: 'This table is showing time by tags'
	        },
	    ], 
		weeklyReportSteps: [
	        {
	            element: '.filters .input-week',
	            intro: 'This is input for choose week'
	        },
	        {
	            element: '.week-table',
	            intro: 'This table is showing details your tasks'
	        },
	    ], 
		taskReportSteps: [
	        {
	            element: '.select2.search-task',
	            intro: 'This is input for adding task to bar'
	        },
	        {
	            element: '.filters-period .period',
	            intro: 'This is inputs for choose period of time'
	        },
	    ], 
	}


});