function include({
    imports
}) {

    class ServiceDeskLandingPageUtilsSNC {

        /**
         * Returns visualization configs
         * @param {object} helpers
         * @param {string} mode
         * @param {number} conditionalRecordCount
         * @return object
         */
        static async getVisualizationConfig(helpers, mode, conditionalRecordCount=0) {
            const evamDef = this.getEvamDef();
            const visualizationConfig = [{
                    "id": "incident_assigned",
                    "tableName": "incident",
                    "tableDisplayValue": "Incident",
                    "myWorkQuery": "active=true^assigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe^state!=6",
                    "myTeamQuery": "active=true^assigned_toISNOTEMPTY^assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^state!=6",
                    "listView": mode == "your_work" ? "sow_landing_page_assigned" : "sow_landing_page",
                    "header": mode == 'your_work' ? await helpers.translate("Incidents assigned to you") : await helpers.translate("Incidents assigned to your team"),
                    "groupByField": "state",
                    "evamId": evamDef['incidentEvamDefinitionId'],
                    "updated_on": "^ORDERBYDESCsys_updated_on",
                },
               
                {
                    "id": "unassigned_incidents",
                    "tableName": "incident",
                    "tableDisplayValue": "Incident",
                    "myWorkQuery": "active=true^assigned_toISEMPTY^assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744",
                    "myTeamQuery": "active=true^assigned_toISEMPTY^assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744",
                    "listView": mode == "your_work" ? "sow_landing_page_assigned" : "sow_landing_page",
                    "header": await helpers.translate("Unassigned incidents"),
                    "groupByField": "priority",
                    "evamId": evamDef['incidentEvamDefinitionId'],
                    "updated_on": "^ORDERBYDESCsys_updated_on",
                },
                {
                    "id": "catalog_tasks",
                    "tableName": "sc_task",
                    "tableDisplayValue": "Catalog Task",
                    "myWorkQuery": "active=true^assigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe",
                    "myTeamQuery": "active=true^assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744",
                    "listView": 'sow_landing_page',
                    "header": mode == 'your_work' ? await helpers.translate("Catalog tasks assigned to you") : await helpers.translate("Catalog tasks assigned to your team"),
                    "groupByField": "state",
                    "evamId": evamDef["catalogTaskEvamDefinitionId"],
                    "updated_on": "^ORDERBYDESCsys_updated_on",
                }
,
                {
                    "id": "incident_sla",
                    "tableName": "task_sla",
                    "tableDisplayValue": "Task SLA",
                    "myWorkQuery": "task.sys_class_name=incident^task.assigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe^task.active=true^sla.type=SLA^ORsla.type=OLA^active=true^time_left<=1970-01-08 00:00:00",
                    "myTeamQuery": "task.sys_class_name=incident^task.assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^task.active=true^sla.type=SLA^ORsla.type=OLA^active=true^time_left<=1970-01-08 00:00:00",
                    "listView": 'sow_landing_page',
                    "header": await helpers.translate("Incident SLAs"),
                    "groupByField": "time_left",
                    "evamId": evamDef['incidentSlaEvamDefinitionId'],
                    "updated_on": "^ORDERBYtime_left",
                }
            ];

            if(mode=='your_work' && conditionalRecordCount>0){
                const conditionalConfig = await this.getConditionalVisualizationConfig(helpers);
                visualizationConfig.push(conditionalConfig);
            }

            return visualizationConfig;
        }

        /**
         * Returns conditional visualization config
         * @param {object} helpers
         * @return object
         */
         static async getConditionalVisualizationConfig(helpers) {
            const evamDef = this.getEvamDef();
            const visualizationConfig = {
                    "id": "delegated_task",
                    "tableName": "task",
                    "tableDisplayValue": "Task",
                    "myWorkQuery": "active=true^assigned_toDYNAMIC0f63961e5f510100a9ad2572f2b47745^assigned_to.sys_id!=javascript: gs.getUserID()^sys_class_name=incident^ORsys_class_name=sc_task",
                    "myTeamQuery": "active=true^assigned_toDYNAMIC0f63961e5f510100a9ad2572f2b47745^assigned_to.sys_id!=javascript: gs.getUserID()^sys_class_name=incident^ORsys_class_name=sc_task",
                    "listView": "sow_landing_page_assigned",
                    "header": await helpers.translate("Tasks delegated to you"),
                    "groupByField": "sys_class_name",
                    "evamId": evamDef['delegatedTaskEvamDefinitionId'],
                    "updated_on": "^ORDERBYDESCsys_updated_on",
                };

            return visualizationConfig;
        }

        /**
         * Returns initial visualization config
         * @param {object} helpers
         * @return object
         */
        static getInitialVisualizationConfig() {
            const visualizationConfig = {
                "table": "incident",
                "elementId": "incident_assigned",
                "title": "Incidents assigned to you",
                "query": "active=true^assigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe^state!=6^ORDERBYDESC$AGGREGATE$^ORDERBYDESCsys_updated_on",
                "evamId": "01a404e8b7203010e69dbc16de11a93f",
                "queryForViewAllRecordCount": "active=true^assigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe^state!=6^ORDERBYDESC$AGGREGATE$^ORDERBYDESCsys_updated_on",
                "tableForViewAllRecordCount": "incident",
                "groupByField": "state",
                "listView": "sow_landing_page_assigned"
            };
            return visualizationConfig;
        }

        /**
         * Build visualization card configurations (Donut)
         * @param {object} helpers
         * @param {string} mode
         * @param {number} conditionalRecordCount
         * @return object
         */
        static async getDonutConfig(helpers, mode, conditionalRecordCount) {
            var donutConfig = [];
            var visualizationConfig = await this.getVisualizationConfig(helpers, mode, conditionalRecordCount);

            for (var i = 0; i < visualizationConfig.length; i++) {
                var obj = {};
                obj = {
                    "id": visualizationConfig[i].id,
                    "header": visualizationConfig[i].header,
                    "evamId": visualizationConfig[i].evamId,
                    "updated_on": visualizationConfig[i]["updated_on"],
                    "listView": visualizationConfig[i].listView,
                    "datasource": [{
                        "isDatabaseView": false,
                        "allowRealTime": true,
                        "sourceType": "table",
                        "label": {
                            "message": visualizationConfig[i].tableDisplayValue
                        },
                        "tableOrViewName": visualizationConfig[i].tableName,
                        "filterQuery": mode == 'your_work' ? visualizationConfig[i].myWorkQuery : visualizationConfig[i].myTeamQuery,
                        "id": visualizationConfig[i].id
                    }],
                    "metric": [{
                        "dataSource": visualizationConfig[i].id,
                        "id": visualizationConfig[i].id + "metric",
                        "aggregateFunction": "COUNT",
                        "numberFormat": {
                            "customFormat": false
                        },
                        "axisId": "primary"
                    }],
                    "groupBy": [{
                        "maxNumberOfGroups": "ALL",
                        "numberOfGroupsBasedOn": "NO_OF_GROUP_BASED_ON_PER_METRIC",
                        "showOthers": false,
                        "hideZeroValues": true,
                        "groupBy": [{
                            "dataSource": visualizationConfig[i].id,
                            "groupByField": visualizationConfig[i].groupByField,
                            "isRange": false,
                            "isPaBucket": false
                        }]
                    }]
                };
                donutConfig.push(obj);
            }

            return donutConfig;
        }

        static getEvamDef() {
            const evamDef = {
                'incidentEvamDefinitionId': '01a404e8b7203010e69dbc16de11a93f',
                'catalogTaskEvamDefinitionId': '4a59c876c7323010d7e818b1c7c26083',
                'delegatedTaskEvamDefinitionId': '615d205d94df0110f87765e94545da03',
                'incidentSlaEvamDefinitionId': '749b857eb7283010e69dbc16de11a98d'
            };
            return evamDef;
        }

        /**
         * Returns configuration for work persona dropdown
         * @param {object} helpers
         * @return {object}
         */
        static async getWorkPersonaConfig(helpers) {
            return {
                "items": [{
                        "id": "your_work",
                        "label": await helpers.translate("Your work")
                    },
                    {
                        "id": "your_team_work",
                        "label": await helpers.translate("Your team's work")
                    }
                ],
                "defaultSelected": ["your_work"]
            }
        }

        static getRangeObject(query, key) {
            var ans = {}
            var queryTokens = query.split('^');
            for (var index in queryTokens) {
                var token = queryTokens[index];
                if (token.indexOf(key) == -1)
                    continue;
                token = token.replace('=', '');
                if (token.indexOf('<') != -1)
                    ans.end_value = token.substring(token.indexOf('<') + 1)
                else
                    ans.start_value = token.substring(token.indexOf('>') + 1)
            }
            return ans;
        }

        static getRangeObjectFromQuerysegment(querySegment, key) {
            var ans = {}
            for(var i=0; i<querySegment.length; i++) {
                var segment = querySegment[i];
                if(segment.field === key) {
                    if(segment.operator.includes(">")) ans.start_value = segment.values[0];
                    else if(segment.operator.includes("<")) ans.end_value = segment.values[0];
                }
            }
            return ans;
        }

        static async getSLAHeader(range, report_ranges, helpers) {
            for (var index in report_ranges) {
                if (range.end_value == report_ranges[index].upper_value_duration)
                    return (await helpers.translate("Incident SLA time remaining - {0}", report_ranges[index].label));
            }
            return (await helpers.translate('Incident SLAs'));
        }

        static getFieldMap() {
            const fieldMap = {
                'State': 'state',
                'Priority': 'priority',
                'Actual time left': 'time_left',
                'Task type': 'sys_class_name'
            };
            return fieldMap;
        }

        static async fetchTitleForSLA(query, reportRanges, helpers, querySegment) {
           var range = {};
            if(querySegment)
                range = this.getRangeObjectFromQuerysegment(querySegment, 'time_left'); 
            else
                range = this.getRangeObject(query, 'time_left');

            return (await this.getSLAHeader(range, reportRanges, helpers));
        }
    
        static async fetchTitle(table, selectedField, groupByField, groupMode = false) {
            if(selectedField == undefined){
                 selectedField = 'all';
                }
            const labelMap = {
                'incident': {
                    'state': {
                        'all':'Incidents',
                        '1': 'New incidents',
                        '2': 'In Progress incidents',
                        '3': 'On Hold incidents',
                        '6': 'Resolved incidents'
                    },
                    'priority': {
                        'all':'Unassigned incidents',
                        '1': 'P1 unassigned incidents',
                        '2': 'P2 unassigned incidents',
                        '3': 'P3 unassigned incidents',
                        '4': 'P4 unassigned incidents',
                        '5': 'P5 unassigned incidents'
                    }
                },
                'sc_task': {
                    'state': {
                        'all':'Catalog tasks',
                        '-5': 'Pending catalog tasks',
                        '1': 'Open catalog tasks',
                        '2': 'Work in progress catalog tasks'
                    }
                },
                'task': {
                    'sys_class_name': {
                        'sc_task': 'Catalog tasks delegated to you',
                        'incident': 'Incidents delegated to you'
                    }
                }
            };

            if((table == 'incident' && groupByField == 'priority') || table == 'task')
                return labelMap[table][groupByField][selectedField];

            if (groupMode)
                return labelMap[table][groupByField][selectedField] + ' assigned to your team';
            return labelMap[table][groupByField][selectedField] + ' assigned to you';
        }

        static async getVisualisationCardConfig(id, helpers, mode, conditionalRecordCount) {
            var visualizationConfig = await this.getVisualizationConfig(helpers, mode, conditionalRecordCount);
            var currentVizSelection = {};
            for (var i = 0; i < visualizationConfig.length; i++) {
                if (visualizationConfig[i].id === id) {
                    currentVizSelection.table = visualizationConfig[i].tableName;
                    currentVizSelection.query = mode === "your_team_work" ? visualizationConfig[i].myTeamQuery + visualizationConfig[i]["updated_on"] : visualizationConfig[i].myWorkQuery + visualizationConfig[i]["updated_on"];
                    currentVizSelection.evamId = visualizationConfig[i].evamId;
                    currentVizSelection.elementId = visualizationConfig[i].id;
                    currentVizSelection.title = visualizationConfig[i].header;
                    currentVizSelection.groupByField = visualizationConfig[i].groupByField;
                    currentVizSelection.listView = visualizationConfig[i].listView;
                    break;
                }
            }
            return currentVizSelection;
        }

        static async getVisualisationCardQuery(vizSelection, nameValueMap, helpers, mode, conditionalRecordCount) {
            var field = this.getFieldMap()[vizSelection.groupBy] !== undefined ? this.getFieldMap()[vizSelection.groupBy] : vizSelection.groupByField;
            var value = nameValueMap[field];
            var query = '';
            var visualizationConfig = await this.getVisualizationConfig(helpers, mode, conditionalRecordCount);
            for (var i = 0; i < visualizationConfig.length; i++) {
                if (visualizationConfig[i].id === vizSelection.elementId) {
                    query = mode === "your_team_work" ? visualizationConfig[i].myTeamQuery : visualizationConfig[i].myWorkQuery;
                    break;
                }
            }
            if (Array.isArray(value)) {
                for (let index in value)
                    query += '^' + field + value[index];
            } else {
                if (value.includes('='))
                    query += '^' + field + value;
                else
                    query += '^' + field + '=' + value;
            }
            return query + visualizationConfig[0]["updated_on"];
        }
    }

    return ServiceDeskLandingPageUtilsSNC;
}