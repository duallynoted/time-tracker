const timeTrackerApp = angular.module('TimeTrackerApp', ['ngMaterial', 'ngRoute']);

timeTrackerApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeController as vm'
    }).when('/entries', {
        templateUrl: 'views/entries.html',
        controller: 'EntriesController as vm'
    }).when('/projects', {
        templateUrl: 'views/projects.html',
        controller: 'ProjectsController as vm'
    }).when('/reports', {
        templateUrl: 'views/reports.html',
        controller: 'ReportsController as vm'
    }).otherwise({
        template: `<h1>404--NOT FOUND</h1>`
    });
}]);

timeTrackerApp.controller('HomeController', ['$http', '$mdToast', '$mdDialog', function ($http, $mdToast, $mdDialog) {
    self = this;
    self.message = ('Angular sure is sharp.');
}]);

timeTrackerApp.controller('EntriesController', ['$http', '$mdToast', '$mdDialog', function ($http, $mdToast, $mdDialog) {
    self = this;
    self.message = ('This is the entry page.');

    self.getEntries = function () {
        console.log('getEntries working');
        $http({
            method: 'GET',
            url: '/entries',
        }).then(function (response) {
            self.entriesArray = response.data;
        }).catch(function (error) {
            alert('Error GETTING entries from server!');
            console.log('Error', error);
        });//end GET entries call
    };//end getEntries

   //this will parse out end time and start time and subtract them to get the total percentage of an hour
    self.timeDiff = function (txt) {
        let st = txt.start_time.split(':');
        let et = txt.end_time.split(':');
        let answer = ((et[0] * 60 + Number(et[1]) + et[2] / 60) - (st[0] * 60 + Number(st[1]) + st[2] / 60)) / 60;
        return answer.toFixed(2);
    };

    //this will convert the date to human readable txt
    self.dateOfProject = function (txt) {
        return moment(txt.date).format('MM/DD/YYYY');
    };

    //this will get projects from the project table DB to display on the html table
    self.getProjects = function () {
        console.log('getProjects working');
        $http({
            method: 'GET',
            url: '/projects',
        }).then(function (response) {
            self.projectsArray = response.data;
            console.log(response.data);
        }).catch(function (error) {
            alert('Error GETTING projects from server!');
            console.log('Error', error);
        });//end GET projects call
    };//end getProjects

    self.addEntry = function (newEntry) {
        $http({
            method: 'POST',
            url: '/entries',
            data: newEntry
        }).then(function (response) {
            console.log('Back from Server with POST', response);
            self.objectToSend = {};
            self.getEntries();
        }).catch(function (error) {
            alert('Unable to add Entry: ', error);
            console.log('Error', error);
        });//end POST call
    };//end addEntry

    self.deleteEntry = function (entryToDelete) {
        $http({
            method: 'DELETE',
            url: '/entries',
            params: entryToDelete
        }).then(function (response) {
            console.log('Delete', response.data);
            swal('Zang!')
            self.getEntries();
        }).catch(function (error) {
            alert('Error DELETING entry from server!')
            console.log('error', error);
        });//end DELETE entries call
    };//end deleteEntry

   //this will (eventually) be used to edit entries
    // self.updateEntry = function(update){
    //     console.log(newEntry);
    //     $http({
    //         method: 'PUT',
    //         url: '/entries',
    //         data: update
    //     }).then(function (response) {
    //         console.log('Back from Server with UPDATE', response);
    //         self.objectToSend = {};
    //         self.getEntries();
    //     }).catch(function (error) {
    //         alert('Unable to add Update: ', error);
    //         console.log('Error', error);
    //     });//end PUT call
    // };//end updateEntry
    self.getEntries();
    self.getProjects();
    // self.updateEntry();
}]);

timeTrackerApp.controller('ProjectsController', ['$http', '$mdToast', '$mdDialog', function ($http, $mdToast, $mdDialog) {
    self = this;
    self.message = ('This is the project page.');

    self.getProjects = function () {
        console.log('getProjects working');
        $http({
            method: 'GET',
            url: '/projects',
        }).then(function (response) {
            self.projectsArray = response.data;
            console.log('getProjects:', response.data);
            for (let i = 0; i < response.data.length; i++) {
                console.log('LOOOOOK', response.data[i]);
                self.getProjectTotals(response.data[i]);
            }
        }).catch(function (error) {
            alert('Error GETTING projects from server!')
            console.log('Error', error);
        });//end GET projects call

        //this will total project hours from self.hoursTotal    
        self.getProjectTotals = function (project) {
            console.log('Project ID = ', project.id);
            $http({
                method: 'GET',
                url: '/projectTotals',
                params: { project_id: project.id }
            }).then(function (response) {
                self.projectTotalsArray = response.data;
                for (let i = 0; i < response.data.length; i++) {
                    console.log('getTotals:', response.data[i]);
                    let totals =self.hoursTotal(response.data[i]);
                    self.projectsArray[i].totalHours = totals;
                    console.log('Look here for TOTALS', project.totalHours);

                }
            }).catch(function (error) {
                alert('Error GETTING project total from server!');
                console.log('Error', error);
            });//end GET projectTotal call        
        };//end getProjectTotals
    };

    self.hoursTotal = function (txt) {
        console.log('HEEEEEEEY', txt);
        let st = txt.start_time.split(':');
        let et = txt.end_time.split(':');
        let answer = ((et[0] * 60 + Number(et[1]) + et[2] / 60) + (st[0] * 60 + Number(st[1]) + st[2] / 60)) / 60;
        
        return answer.toFixed(2);
    }

    self.addProject = function (newProject) {
        console.log(newProject);
        $http({
            method: 'POST',
            url: '/projects',
            data: newProject
        }).then(function (response) {
            console.log('Back from Server with POST', response);
            self.objectToSend = {};
            self.getProjects();
        }).catch(function (error) {
            alert('Unable to add Project: ', error);
            console.log('Error', error);
        });//end POST call
    };//end addProject

    self.deleteProject = function (projectToDelete) {
        $http({
            method: 'DELETE',
            url: '/projects',
            params: projectToDelete
        }).then(function (response) {
            console.log('Delete', response.data);
            self.getProjects();
        }).catch(function (error) {
            swal('Project cannot be completed until all entries are finished')
            console.log('error', error);
        });//end DELETE project call
    };//end deleteProject
    self.getProjects();
    // self.getProjectTotals(project);
}]);

timeTrackerApp.controller('ReportsController', ['$http', '$mdToast', '$mdDialog', function ($http, $mdToast, $mdDialog) {
    self = this;
    self.message = ('This is the report page.');
}]);