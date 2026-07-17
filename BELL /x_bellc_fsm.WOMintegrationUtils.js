​var WOMintegrationUtils = Class.create();
WOMintegrationUtils.prototype = {

    // Need to add new syt_properties for logs
    WOM_LOG: "bell.integration.wom.log.level",
    LIST_BOOLEAN_FIELD: [],

    NEED_APPOINTMENT_MISSING: gs.getMessage("Needs appointment property is missing."),
    NEED_APPOINTMENT_INVALID: gs.getMessage("Needs appointment invalid."),
    SHORT_DESCRIPTION_MISSING: gs.getMessage("Short description property is missing."),
    SHORT_DESCRIPTION_EMPTY: gs.getMessage("Short description is empty."),
    DATA_MISSING: gs.getMessage("Request data is missing."),
    TEMPLATE_ID_MISSING: gs.getMessage("Template is missing."),
    TEMPLATE_ID_NOT_FOUND: gs.getMessage("Template not found."),
    CATALOG_ID_MISSING: gs.getMessage("Catalog ID parameter is missing."),
    CATALOG_ID_NOT_FOUND: gs.getMessage("Catalog ID not found."),
    OPEN_FOR_MISSING: gs.getMessage("Open For ID parameter is missing."),
    OPEN_FOR_NOT_FOUND: gs.getMessage("Open For not found."),
    CONFIG_RULE_MISSING: gs.getMessage("Configuration Rule parameter is missing."),
    CONFIG_RULE_NOT_FOUND: gs.getMessage("Configuration Rule not found."),
    WO_ID_MISSING: gs.getMessage("Parent work order property is missing."),
    WO_ID_NOT_FOUND: gs.getMessage("Parent work order not found."),
    LOCATION_ID_MISSING: gs.getMessage("Location is missing."),
    LOCATION_ID_NOT_FOUND: gs.getMessage("Location not found."),
    START_DATE_MISSING: gs.getMessage("Start Date  parameter is missing."),
    ACTUAL_START_DATE_MISSING: gs.getMessage("Actual Start Date  parameter is missing."),
    END_DATE_MISSING: gs.getMessage("End Date  parameter is missing."),
    ACTUAL_END_DATE_MISSING: gs.getMessage("Actual End Date  parameter is missing."),
    TIMEZONE_MISSING: gs.getMessage("Timezone  parameter is missing."),
    WINDOW_START_MISSING: gs.getMessage("Window start is missing."),
    WINDOW_START_INVALID: gs.getMessage("Window start datetime invalid."),
    WINDOW_END_MISSING: gs.getMessage("Window end is missing."),
    WINDOW_END_INVALID: gs.getMessage("Window end datetime invalid."),
    DUE_DATE_MISSING: gs.getMessage("Due date is missing."),
    DUE_DATE_INVALID: gs.getMessage("Due date datetime invalid."),
    ESTIMATED_WORK_MISSING: gs.getMessage("Estimated work duration is missing."),
    ESTIMATED_WORK_INVALID: gs.getMessage("Estimated work duration invalid."),
    CORRELATION_ID_MISSING: "Correlation id is missing.",
    CORRELATION_ID_INVALID: "Correlation id is empty.",
    CORRELATION_ID_NOT_MATCH: "Correlation id not matching original.",
    STATE_MISSING: "State is missing.",
    STATE_NOT_FOUND: "State not found.",
    INTERNAL_ERROR: gs.getMessage("Internal Error."),
    MESSAGE_SUCCESS: gs.getMessage("Operation completed."),
    WOT_ID_NOT_FOUND: gs.getMessage("WOT sys_id not found"),
    WOT_ID_MISSING: gs.getMessage("WOT sys_id property is missing"),
    SOMETHING_WENT_WRONG: gs.getMessage("Something went wrong"),
    CANCEL_SUCESS: gs.getMessage("WOT cancelled"),
    WOT_STATE_UPDATE_SUCCESS: gs.getMessage("WOT state update success"),
    WOT_UPDATE_SUCCESS: gs.getMessage("WOT update success"),
    WORK_NOTES_MANDATORY: gs.getMessage("provide a work note for closing wot"),
    WOT_ALREADY_CANCELLED: gs.getMessage("Cannot cancel an inactive WOT"),
    WOT_BAD_STATE: gs.getMessage("bad wot state"),
    WOT_WINDOW_END_AFTER_WINDOW_START: gs.getMessage("Window end must be after window start"),
    WOT_WINDOW_END_BEFORE_ACTUAL_DATE: gs.getMessage("Window end must be after actual date time "),
    WOT_PARENT_DRAFT: gs.getMessage("WOT can't be cancelled because the parent WO is in draft state"),
    EMPTY_TERRITORY: gs.getMessage("The location is not associated with a territory"),
    NO_DISPATCH_GROUP: gs.getMessage("No dispatch group available for this territory"),
    UPDATE_ERROR_WO: gs.getMessage("Cannot create a Work Order Task, parent Work Order inactive."),
    UPDATE_ERROR_WOT: gs.getMessage("Update error work order task"),
    PRIORITY_MISSING: gs.getMessage("Priority is missing."),
    PRIORITY_NOT_fOUND: gs.getMessage("Priority not found"),
    WOT_APPT_END_AFTER_APPT_START: gs.getMessage("The parameter u_external_appointment_end_time has to be after the parameter u_external_appointment_start_time."),
    WOT_UPDATE_SUCCESS_SKILLS_ERROR: gs.getMessage("Fail to update WOT error in skills array: "),
    WOT_UPDATE_EMPTY_SKILLS: gs.getMessage('Fail to update WOT skill array is empty'),
    SKILLS_MISSING: gs.getMessage('Skills array is missing.'),
    WOT_SKILLS_INCORRECT_FORMAT: gs.getMessage('Skills array is empty.'),
    BAD_SUBSATE: gs.getMessage("Bad request , Substate parameter is not found"),
    SUBSATE_NOT_FOUND: gs.getMessage("Sub-state not found."),
    BAD_COMBINATION_STATE_SUBSTATE: gs.getMessage("State and Substate combination is wrong"),
    REASON_CODE_NOT_FOUND: gs.getMessage("Reason code not found."),
    REASON_CODE_MISSING: gs.getMessage("Reason code is missing."),
    EXTERNAL_APPOINTMENT_END_TIME: gs.getMessage("External appointment end time datetime invalid."),
    EXTERNAL_APPOINTMENT_START_TIME: gs.getMessage("External appointment start time datetime invalid."),
    ASSOCIATE_ORDER_EMPTY: gs.getMessage("Associated Order is empty."),
    INSTALLATION_TYPE_NOT_FOUND: gs.getMessage("Installation Type not found"),
    JEOPARTY_STATE_NOT_FOUND: gs.getMessage("Jeopardy State not found"),
    RULE_VIOLATION_NOT_FOUND: gs.getMessage("Rule Violation not found in reference data dictionary"),
    JOB_CLASSIFICATION_NOT_FOUND: gs.getMessage("JOB Classification  not found"),
    JOB_CLASSIFICATION_EMPTY: gs.getMessage("JOB Classification  Empty"),
    MATERIAL_STATUS_NOT_FOUND: gs.getMessage("Material  Status not found"),
    ORIGINATING_SYSTEM_EMPTY: gs.getMessage("Originating system empty"),
    ASSIGNED_TO_NOT_FOUND: gs.getMessage("Assigned to not found"),
    EXPECTED_START_INVALID: gs.getMessage("Expected start datetime invalid."),
    USER_NOT_MEMBER_OF_GROUP: gs.getMessage("The user is not member of the assignment group of the task."),
    NO_ASSIGNMENT_GROUP: gs.getMessage("No assignment group match the dispatch group."),
    USER_NOT_MEMBER_OF_ASSIGN_GROUP: gs.getMessage("The user is not member of the assignment group."),
    TECHNICIAN_NOT_AVAILABLE: gs.getMessage("Tech is unavailable during scheduled time. Please select another tech or reschedule the time. Conflict task"),
    REF_DATA_EXTERNAL_ID_NOT_VALID: gs.getMessage("Reference Data Property Value invalid"),
    CONSUMED_DIC: "x_bellc_fsm_consumed_dictionary",
    EXTERNAL_IDs_Table: "u_task_m2m_external_id",
    /*EXTERNAL_IDs_LIST_ROLE: [
        "ACCESSCIRCUITID",
        "ASSOCIATEDBILLINGTN",
        "ASSOCIATEDORDER",
        "BUSINESSOFFICEID",
        "CIRCUITNUMBER",
        "HIGHSPEEDUSERID",
        "HOUSEHOLDID",
        "IPACTTASK",
        "CSAP",
        "SERVICETN",
        "PURCHASEORDERNUMBER",
        "SOURCEORDERID",
        "SOURCETASKID"
    ],*/
    WOT_INITIAL: "",
    STATE_FLOW: {
        17: "a60426a0d7630100fceaa6859e6103e3",
        18: "b48e00ead7201100158ba6859e6103c7",
        3: "6c1f62e0d7630100fceaa6859e610381",
        4: "41dfa2e0d7630100fceaa6859e61035d",
        7: "ffc7a360d7230100fceaa6859e6103ae",
        12: "8d36c8eac3d13010a0cd587c1f40dd09"
    },
    MH_PICK_UP_INVALID: gs.getMessage("Mh Pick Up invalid."),
    AMALGAMATED_IDS_INVALID: gs.getMessage("Amalgamated ids invalid."),
    RELATED_CONTACTS_EMPTY: gs.getMessage("Empty related_contacts"),
    RELATED_CONTACTS_NOT_FOUND_CREATE: gs.getMessage("FSM contact does not found"),
    RELATED_CONTACTS_NOT_FOUND_UPDATE: gs.getMessage("FSM contact not found"),
    RELATED_CONTACTS_TABLE: "x_bellc_fsm_related_contacts",
    FSM_CONTACT_TABLE: "x_bellc_fsm_contact",

    initialize: function() {

        var grSD = new GlideRecord('sys_dictionary');
        grSD.addEncodedQuery("nameINwm_task,sm_task,task^internal_type=boolean");
        grSD.query();
        while (grSD.next()) {
            this.LIST_BOOLEAN_FIELD.push(grSD.element.toString());
        }



    },
    createWOT: function(data) {
        var bellErrUtil = new FSMBellInternalErrorUtil();

        try {

            var templateID = data.template ? data.template : null;
            var workOrderID = data.parent ? data.parent : null;
            var locationID = data.location ? data.location : null;
            var windowStart = data.window_start ? data.window_start : null;
            var windowEnd = data.window_end ? data.window_end : null;
            var dueDate = data.due_date ? data.due_date : null;
            var estimate_work_duration = data.estimated_work_duration ? data.estimated_work_duration : null;
            var shortDescription = data.short_description ? data.short_description : null;
            var skills_array = data.skills ? data.skills : null;
            var state = data.state ? data.state : null;

            if (data.hasOwnProperty("external_ids") && gs.nil(this.getRefData_ExternalId(data.external_ids, "sys_id")))
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-invalid",
                    this.REF_DATA_EXTERNAL_ID_NOT_VALID, {},
                    bellErrUtil.buildCausedBy(this.REF_DATA_EXTERNAL_ID_NOT_VALID)
                );

            if (data.hasOwnProperty("related_contacts")) {
                if (gs.nil(data.related_contacts)) {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        400,
                        "property-invalid",
                        this.RELATED_CONTACTS_EMPTY, {},
                        bellErrUtil.buildCausedBy(this.RELATED_CONTACTS_EMPTY)
                    );
                }
                if (!this.validateRelatedContacts(data.related_contacts)) {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        404,
                        "property-invalid",
                        this.RELATED_CONTACTS_NOT_FOUND_CREATE, {},
                        bellErrUtil.buildCausedBy(this.RELATED_CONTACTS_NOT_FOUND_CREATE)
                    );
                }
            }


            if (!data.hasOwnProperty("needs_appointment")) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-missing",
                    this.NEED_APPOINTMENT_MISSING, {},
                    bellErrUtil.buildCausedBy(this.NEED_APPOINTMENT_MISSING)
                );
            }

            if (data.needs_appointment !== "true" && data.needs_appointment !== "false" && data.needs_appointment !== "")
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-invalid",
                    this.NEED_APPOINTMENT_INVALID, {},
                    bellErrUtil.buildCausedBy(this.NEED_APPOINTMENT_INVALID)
                );

            if (gs.nil(templateID)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-missing",
                    this.TEMPLATE_ID_MISSING, {},
                    bellErrUtil.buildCausedBy(this.TEMPLATE_ID_MISSING)
                );
            }

            if (!this.verifyTemplateWOT(templateID)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-invalid",
                    this.TEMPLATE_ID_NOT_FOUND, {},
                    bellErrUtil.buildCausedBy(this.TEMPLATE_ID_NOT_FOUND)
                );
            }

            if (!data.hasOwnProperty("correlation_id")) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-missing",
                    this.CORRELATION_ID_MISSING, {},
                    bellErrUtil.buildCausedBy(this.CORRELATION_ID_MISSING)
                );
            }

            if (gs.nil(data.correlation_id.trim())) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-invalid",
                    this.CORRELATION_ID_INVALID, {},
                    bellErrUtil.buildCausedBy(this.CORRELATION_ID_INVALID)
                );
            }

            if (gs.nil(state)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-missing",
                    this.STATE_MISSING, {},
                    bellErrUtil.buildCausedBy(this.STATE_MISSING)
                );
            }

            if (!this.isValidState(state, "create")) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-invalid",
                    this.STATE_NOT_FOUND, {},
                    bellErrUtil.buildCausedBy(this.STATE_NOT_FOUND)
                );
            }

            if (gs.nil(workOrderID)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-missing",
                    this.WO_ID_MISSING, {},
                    bellErrUtil.buildCausedBy(this.WO_ID_MISSING)
                );
            }

            if (!this.verifyWO(workOrderID)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-invalid",
                    this.WO_ID_NOT_FOUND, {},
                    bellErrUtil.buildCausedBy(this.WO_ID_NOT_FOUND)
                );
            }

            if (gs.nil(locationID)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-missing",
                    this.LOCATION_ID_MISSING, {},
                    bellErrUtil.buildCausedBy(this.LOCATION_ID_MISSING)
                );
            }

            /*if (!data.hasOwnProperty("u_code_reason") || gs.nil(data.u_code_reason))
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-missing",
                    this.REASON_CODE_MISSING,
                    {},
                    bellErrUtil.buildCausedBy(this.REASON_CODE_MISSING)
                );*/

            if (!gs.nil(data.u_code_reason) && this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_code_reason^code=" + data.u_code_reason) == -1) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-invalid",
                    this.REASON_CODE_NOT_FOUND, {},
                    bellErrUtil.buildCausedBy(this.REASON_CODE_NOT_FOUND)
                );
            }

            if (!this.verifyLocation(locationID)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-invalid",
                    this.LOCATION_ID_NOT_FOUND, {},
                    bellErrUtil.buildCausedBy(this.LOCATION_ID_NOT_FOUND)
                );
            }

            if (gs.nil(windowStart)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-missing",
                    this.WINDOW_START_MISSING, {},
                    bellErrUtil.buildCausedBy(this.WINDOW_START_MISSING)
                );
            }

            if (!this.isValidDateTime(windowStart)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-invalid",
                    this.WINDOW_START_INVALID, {},
                    bellErrUtil.buildCausedBy(this.WINDOW_START_INVALID)
                );
            }

            if (gs.nil(windowEnd)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-missing",
                    this.WINDOW_END_MISSING, {},
                    bellErrUtil.buildCausedBy(this.WINDOW_END_MISSING)
                );
            }

            if (!this.isValidDateTime(windowEnd)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-invalid",
                    this.WINDOW_END_INVALID, {},
                    bellErrUtil.buildCausedBy(this.WINDOW_END_INVALID)
                );
            }

            if (gs.nil(dueDate)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-missing",
                    this.DUE_DATE_MISSING, {},
                    bellErrUtil.buildCausedBy(this.DUE_DATE_MISSING)
                );
            }

            if (!this.isValidDateTime(dueDate)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-invalid",
                    this.DUE_DATE_INVALID, {},
                    bellErrUtil.buildCausedBy(this.DUE_DATE_INVALID)
                );
            }

            if (gs.nil(estimate_work_duration)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-missing",
                    this.ESTIMATED_WORK_MISSING, {},
                    bellErrUtil.buildCausedBy(this.ESTIMATED_WORK_MISSING)
                );
            }

            if (!this.isValidDuration(estimate_work_duration)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-invalid",
                    this.ESTIMATED_WORK_INVALID, {},
                    bellErrUtil.buildCausedBy(this.ESTIMATED_WORK_INVALID)
                );
            }

            if (!data.hasOwnProperty("short_description")) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-missing",
                    this.SHORT_DESCRIPTION_MISSING, {},
                    bellErrUtil.buildCausedBy(this.SHORT_DESCRIPTION_MISSING)
                );
            }

            if (gs.nil(data.short_description.trim())) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-invalid",
                    this.SHORT_DESCRIPTION_EMPTY, {},
                    bellErrUtil.buildCausedBy(this.SHORT_DESCRIPTION_EMPTY)
                );
            }

            if (gs.nil(data.priority)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-missing",
                    this.PRIORITY_MISSING, {},
                    bellErrUtil.buildCausedBy(this.PRIORITY_MISSING)
                );
            }

            if (gs.nil(skills_array)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-missing",
                    this.SKILLS_MISSING, {},
                    bellErrUtil.buildCausedBy(this.SKILLS_MISSING)
                );
            }

            if (!gs.nil(data.priority) && this.isValidPriority(data.priority) == false) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-invalid",
                    this.PRIORITY_NOT_fOUND, {},
                    bellErrUtil.buildCausedBy(this.PRIORITY_NOT_fOUND)
                );
            }

            if (!gs.nil(data.u_external_appointment_start_time) && !this.isValidDateTime(data.u_external_appointment_start_time)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-invalid",
                    this.EXTERNAL_APPOINTMENT_START_TIME, {},
                    bellErrUtil.buildCausedBy(this.EXTERNAL_APPOINTMENT_START_TIME)
                );
            }

            if (!gs.nil(data.u_external_appointment_end_time) && !this.isValidDateTime(data.u_external_appointment_end_time)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-invalid",
                    this.EXTERNAL_APPOINTMENT_END_TIME, {},
                    bellErrUtil.buildCausedBy(this.EXTERNAL_APPOINTMENT_END_TIME)
                );
            }

            // if (data.hasOwnProperty("u_associated_order_ids") && gs.nil(data.u_associated_order_ids))
            //     return bellErrUtil.generateBellInternalErrorResponse(
            //         404,
            //         "property-invalid",
            //         this.ASSOCIATE_ORDER_EMPTY,
            //         {},
            //         bellErrUtil.buildCausedBy(this.ASSOCIATE_ORDER_EMPTY)
            //     );

            if (!gs.nil(data.u_installation_type) && this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_installation_type^code=" + data.u_installation_type) == -1)
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-invalid",
                    this.INSTALLATION_TYPE_NOT_FOUND, {},
                    bellErrUtil.buildCausedBy(this.INSTALLATION_TYPE_NOT_FOUND)
                );

            if (!gs.nil(data.u_jeopardy_state) && this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_jeopardy_state^codeIN" + data.u_jeopardy_state, data.u_jeopardy_state) == -1)
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-invalid",
                    this.JEOPARTY_STATE_NOT_FOUND, {},
                    bellErrUtil.buildCausedBy(this.JEOPARTY_STATE_NOT_FOUND)
                );

            if (!gs.nil(data.u_rule_violations) &&
                this.getReferenceData("x_bellc_fsm_consumed_dictionary",
                    "active=true^target_field=u_rule_violations^codeIN" + data.u_rule_violations,
                    data.u_rule_violations) == -1)
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-invalid",
                    this.RULE_VIOLATION_NOT_FOUND, {},
                    bellErrUtil.buildCausedBy(this.RULE_VIOLATION_NOT_FOUND)
                );

            if (data.hasOwnProperty("u_job_classification") && gs.nil(data.u_job_classification))
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-missing",
                    this.JOB_CLASSIFICATION_EMPTY, {},
                    bellErrUtil.buildCausedBy(this.JOB_CLASSIFICATION_EMPTY)
                );

            if (!gs.nil(data.u_job_classification) && this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_job_classification^code=" + data.u_job_classification) == -1)
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-invalid",
                    this.JOB_CLASSIFICATION_NOT_FOUND, {},
                    bellErrUtil.buildCausedBy(this.JOB_CLASSIFICATION_NOT_FOUND)
                );

            if (!gs.nil(data.u_material_status) && this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_material_status^code=" + data.u_material_status) == -1)
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-invalid",
                    this.MATERIAL_STATUS_NOT_FOUND, {},
                    bellErrUtil.buildCausedBy(this.MATERIAL_STATUS_NOT_FOUND)
                );

            //u_originating_system
            if (data.hasOwnProperty("u_originating_system") && gs.nil(data.u_originating_system))
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-invalid",
                    this.ORIGINATING_SYSTEM_EMPTY, {},
                    bellErrUtil.buildCausedBy(this.ORIGINATING_SYSTEM_EMPTY)
                );

            // u_task_type
            if (data.hasOwnProperty("u_task_type") && gs.nil(data.u_task_type))
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-missing",
                    "Task Type empty", {},
                    bellErrUtil.buildCausedBy("Task Type empty")
                );

            if (!gs.nil(data.u_task_type) && this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_task_type^code=" + data.u_task_type) == -1)
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-invalid",
                    "Task Type not Found", {},
                    bellErrUtil.buildCausedBy("Task Type not Found")
                );

            //u_work_type_action
            if (!gs.nil(data.u_work_type_action) && this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_work_type_action^code=" + data.u_work_type_action) == -1)
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-invalid",
                    "Task Type Action not Found", {},
                    bellErrUtil.buildCausedBy("Task Type Action not Found")
                );

            //u_plant_ready_date
            if (!gs.nil(data.u_plant_ready_date) && !this.isValidDateTime(data.u_plant_ready_date)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-invalid",
                    "Plant Ready Date invalid Date", {},
                    bellErrUtil.buildCausedBy("Plant Ready Date invalid Date")
                );
            }

            //u_plant_test_date
            if (!gs.nil(data.u_plant_test_date) && !this.isValidDateTime(data.u_plant_test_date)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-invalid",
                    "Plant Test Date invalid Date", {},
                    bellErrUtil.buildCausedBy("Plant Test Date invalid Date")
                );
            }

            //u_source_received_date
            if (!gs.nil(data.u_source_received_date) && !this.isValidDateTime(data.u_source_received_date)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-invalid",
                    "Source Received Date invalid Date", {},
                    bellErrUtil.buildCausedBy("Source Received Date invalid Date")
                );
            }

            // u_perceived_severity
            if (!gs.nil(data.u_perceived_severity) && this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_perceived_severity^code=" + data.u_perceived_severity) == -1)
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-invalid",
                    "Perceived Severity not Found", {},
                    bellErrUtil.buildCausedBy("Perceived Severity not Found")
                );

            if (Array.isArray(skills_array) && skills_array.length == 0)
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "validation-error",
                    this.WOT_SKILLS_INCORRECT_FORMAT, {},
                    bellErrUtil.buildCausedBy(this.WOT_SKILLS_INCORRECT_FORMAT)
                );

            //check if window_end is before window_start
            if (data.window_end != null && data.window_start != null) {
                var win_end = new GlideDateTime(data.window_end);
                var win_start = new GlideDateTime(data.window_start);
                var actual_date = new GlideDateTime();
                if (win_end < win_start) {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        400,
                        "validation-error",
                        this.WOT_WINDOW_END_AFTER_WINDOW_START, {},
                        bellErrUtil.buildCausedBy(this.WOT_WINDOW_END_AFTER_WINDOW_START)
                    );
                }
                // if (win_end < actual_date)
                //     return bellErrUtil.generateBellInternalErrorResponse(
                //         400,
                //         "validation-error",
                //         this.WOT_WINDOW_END_BEFORE_ACTUAL_DATE,
                //         {},
                //         bellErrUtil.buildCausedBy(this.WOT_WINDOW_END_BEFORE_ACTUAL_DATE)
                //     );
            }

            var validSkill = this.isValidSkill(skills_array);
            if (validSkill.valid == false) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    validSkill.code,
                    validSkill.errorCode,
                    validSkill.message, {},
                    bellErrUtil.buildCausedBy(validSkill.message)
                );
            }


            // All checks passed — continue with logic
            var grWmOrderTask = new GlideRecord('wm_task');
            grWmOrderTask.initialize();

            // Insert mandatories fields
            grWmOrderTask.template = templateID;
            grWmOrderTask.location = locationID;
            grWmOrderTask.parent = workOrderID;
            grWmOrderTask.window_start = windowStart;
            grWmOrderTask.window_end = windowEnd;
            grWmOrderTask.priority = data.priority;
            grWmOrderTask.estimated_work_duration = estimate_work_duration;
            grWmOrderTask.short_description = data.short_description;
            grWmOrderTask.correlation_id = data.correlation_id;
            grWmOrderTask.due_date = dueDate;

            // Optional fields
            grWmOrderTask.correlation_display = data.correlation_display;
            grWmOrderTask.u_external_appointment_id = data.u_external_appointment_id ? data.u_external_appointment_id : null;
            grWmOrderTask.u_external_appointment_start_time = data.u_external_appointment_start_time ? data.u_external_appointment_start_time : null;
            grWmOrderTask.u_external_appointment_end_time = data.u_external_appointment_end_time ? data.u_external_appointment_end_time : null;
            /*grWmOrderTask.u_is_eta_required = data.u_is_eta_required;
            grWmOrderTask.u_estimated_time_of_arrival = data.u_estimated_time_of_arrival;*/



            //NOVA 1591
            if (!gs.nil(data.u_code_reason))
                grWmOrderTask.u_code_reason = this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_code_reason^code=" + data.u_code_reason);

            if (!gs.nil(data.u_associated_order_ids)) {
                grWmOrderTask.u_associated_order_ids = data.u_associated_order_ids;
            }
            if (!gs.nil(data.u_business_office_id)) {
                grWmOrderTask.u_business_office_id = data.u_business_office_id;
            }
            if (!gs.nil(data.u_is_charge_cost)) {
                grWmOrderTask.u_is_charge_cost = data.u_is_charge_cost;
            }
            if (!gs.nil(data.u_installation_type)) {
                grWmOrderTask.u_installation_type = data.u_installation_type;
            }
            if (!gs.nil(data.u_is_cancelled_from_source)) {
                grWmOrderTask.u_is_cancelled_from_source = data.u_is_cancelled_from_source;
            }
            if (data.hasOwnProperty("u_jeopardy_state")) {
                if (data.u_jeopardy_state === "") {
                    grWmOrderTask.u_jeopardy_state = ""; // Reset
                } else {
                    grWmOrderTask.u_jeopardy_state = this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_jeopardy_state^codeIN" + data.u_jeopardy_state, data.u_jeopardy_state).toString();
                }
            }
            if (!gs.nil(data.u_is_charge_cost)) {
                grWmOrderTask.u_is_charge_cost = data.u_is_charge_cost;
            }


            if (data.hasOwnProperty("u_rule_violations") && data.u_rule_violations !== "") {
                grWmOrderTask.u_rule_violations = this.getReferenceData(
                    "x_bellc_fsm_consumed_dictionary",
                    "active=true^target_field=u_rule_violations^codeIN" + data.u_rule_violations,
                    data.u_rule_violations
                ).toString();
            }
            if (!gs.nil(data.u_job_classification)) {
                grWmOrderTask.u_job_classification = data.u_job_classification;
            }
            if (!gs.nil(data.u_material_status)) {
                grWmOrderTask.u_material_status = data.u_material_status;
            }
            if (!gs.nil(data.u_source_open_date)) {
                grWmOrderTask.u_source_open_date = data.u_source_open_date;
            }
            if (!gs.nil(data.u_originating_system)) {
                grWmOrderTask.u_originating_system = data.u_originating_system;
            }
            if (!gs.nil(data.u_pattern)) {
                grWmOrderTask.u_pattern = data.u_pattern;
            }
            if (!gs.nil(data.u_priority_code)) {
                grWmOrderTask.u_priority_code = data.u_priority_code;
            }
            if (!gs.nil(data.u_service_tn)) {
                grWmOrderTask.u_service_tn = data.u_service_tn;
            }
            if (!gs.nil(data.u_source_clli)) {
                grWmOrderTask.u_source_clli = data.u_source_clli;
            }

            if (!gs.nil(data.u_source_order_id)) {
                grWmOrderTask.u_source_order_id = data.u_source_order_id;
            }
            if (!gs.nil(data.u_source_task_id)) {
                grWmOrderTask.u_source_task_id = data.u_source_task_id;
            }
            if (!gs.nil(data.u_task_type)) {
                grWmOrderTask.u_task_type = data.u_task_type;
            }
            if (!gs.nil(data.u_work_type_action)) {
                grWmOrderTask.u_work_type_action = data.u_work_type_action;
            }
            // if (!gs.nil(data.u_da_lda)) {
            //     grWmOrderTask.u_da_lda = data.u_da_lda;
            // }
            if (!gs.nil(data.u_is_service_affecting)) {
                grWmOrderTask.u_is_service_affecting = data.u_is_service_affecting;
            }
            if (!gs.nil(data.u_plant_ready_date)) {
                grWmOrderTask.u_plant_ready_date = data.u_plant_ready_date;
            }
            if (!gs.nil(data.u_plant_test_date)) {
                grWmOrderTask.u_plant_test_date = data.u_plant_test_date;
            }
            if (!gs.nil(data.u_source_received_date)) {
                grWmOrderTask.u_source_received_date = data.u_source_received_date;
            }
            if (!gs.nil(data.u_perceived_severity)) {
                grWmOrderTask.u_perceived_severity = data.u_perceived_severity;
            }
            if (!gs.nil(data.u_has_helper_task)) {
                grWmOrderTask.u_has_helper_task = data.u_has_helper_task;
            }
            // market type
            if (!gs.nil(data.u_market_type) && this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_market_type^code=" + data.u_market_type) != -1)
                grWmOrderTask.u_market_type = data.u_market_type;
            // reset data
            if (data.hasOwnProperty("u_market_type") && gs.nil(data.u_market_type)) grWmOrderTask.u_market_type = "";



            // if (!gs.nil(data.work_start )) {
            //     grWmOrderTask.work_start  = data.work_start ;
            // }
            // if (!gs.nil(data.work_end )) {
            //     grWmOrderTask.work_end  = data.work_end ;
            // }


            // end NOVA 1591

            // if (gs.nil(this.moveParentToAwaitingQualification(workOrderID))) {
            //     return bellErrUtil.generateBellInternalErrorResponse(
            //         500,
            //         "validation-error",
            //         this.UPDATE_ERROR_WO,
            //         {},
            //         bellErrUtil.buildCausedBy(this.UPDATE_ERROR_WO)
            //     );
            // }



            if (!gs.nil(data.u_amalgamated_ids)) {
                grWmOrderTask.u_amalgamated_ids = data.u_amalgamated_ids;
            }

            if (!gs.nil(data.expected_start) && !this.isValidDateTime(data.expected_start)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-invalid",
                    this.EXPECTED_START_INVALID, {},
                    bellErrUtil.buildCausedBy(this.EXPECTED_START_INVALID)
                );
            }

            if (!gs.nil(data.expected_start)) {
                if (!gs.nil(data.window_start)) {
                    if (new GlideDateTime(data.window_start) > new GlideDateTime(data.expected_start)) {

                        var msg = gs.getMessage(
                            "Window start should be before Scheduled start"
                        );

                        return bellErrUtil.generateBellInternalErrorResponse(400,
                            "validation-error",
                            msg, {},
                            bellErrUtil.buildCausedBy(msg)
                        );
                    }
                }

                grWmOrderTask.expected_start = data.expected_start;
            }

            var validTechPref;
            if (data.task_tech_preference) {
                validTechPref = this.isValidTechPreference(data.task_tech_preference, 'create');
                if (validTechPref.valid == false) {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        validTechPref.code,
                        validTechPref.errorCode,
                        validTechPref.message, {},
                        bellErrUtil.buildCausedBy(validTechPref.message)
                    );
                }
            }

            var resultWot = grWmOrderTask.insert();
            if (gs.nil(resultWot))
                return bellErrUtil.generateBellInternalErrorResponse(
                    500,
                    "unexpected-server-error",
                    this.INTERNAL_ERROR, {},
                    bellErrUtil.buildCausedBy(this.INTERNAL_ERROR)
                );

            if (resultWot && data.hasOwnProperty("external_ids")) {
                var externalIdRefData = this.getRefData_ExternalId(data.external_ids, resultWot);
                gs.info(externalIdRefData + "externalIdRefDataTest");
                if (!gs.nil(externalIdRefData)) {
                    for (var j in externalIdRefData) {
                        this.insertRecord(externalIdRefData[j], "u_task_m2m_external_id");
                    }
                }
            }

            if (resultWot && data.hasOwnProperty("related_contacts") && !gs.nil(data.related_contacts)) {
                this.insertRelatedContacts(data.related_contacts, resultWot);
            }


            if (data.skills)
                this.createTaskSkills(data.skills, resultWot);


            if (data.state == "4") {
                var cancelWot = new global.WOMUtils2().incompleteWOT(resultWot, data);
                if (cancelWot == true)
                    return this.generateResponseWithCode_CreateWOT(200, true, this.MESSAGE_SUCCESS, this.getJsonData(resultWot, 'wm_task'));
                else {
                    new global.WOMUtils2().deleteWot(resultWot);
                    return bellErrUtil.generateBellInternalErrorResponse(
                        500,
                        "unexpected-server-error",
                        this.INTERNAL_ERROR + " : Incompleted task not complete", {},
                        bellErrUtil.buildCausedBy(this.INTERNAL_ERROR)
                    );
                }
            }
            var techPrefCreate;
            if (data.task_tech_preference) {
                techPrefCreate = this.createTechPreference(data.task_tech_preference, resultWot)

            }
            if (data.task_tech_preference && techPrefCreate != 1) {
                return techPrefCreate;
            } else {
                if (data.state.toString() == "1")
                    return this.generateResponseWithCode_CreateWOT(200, true, this.MESSAGE_SUCCESS + " stta:" + data.state, this.getJsonData(resultWot, 'wm_task'));
                else
                    return this.moveWotToPendingDispatch(resultWot);
            }

        } catch (e) {
            return bellErrUtil.generateBellInternalErrorResponse(
                500,
                "unexpected-server-error",
                this.INTERNAL_ERROR + " :" + JSON.stringify(e.message), {},
                bellErrUtil.buildCausedBy(this.INTERNAL_ERROR + " :" + JSON.stringify(e.message))
            );
        }
    },



    verifyChildWot: function(parentSysID) {
        var childWot = new GlideRecord('wm_task');
        childWot.addQuery('parent', parentSysID);
        //childWot.addQuery('state',1);
        childWot.query();
        return (childWot.getRowCount() >= 1);
    },

    moveParentToAwaitingQualification: function(sysID) {
        var parentWo = new GlideRecord('wm_order');
        if (parentWo.get(sysID)) {
            if (parentWo.state == 1) {
                parentWo.state = 15;
                parentWo.setWorkflow(false);
                return parentWo.update();
            } else if (parentWo.state == 3 || parentWo.state == 4 || parentWo.state == 7) {
                return null;
            } else {
                return sysID;
            }
        }
    },

    moveWotToPendingDispatch: function(sysIDWot) {
        var wot = new GlideRecord('wm_task');
        if (wot.get(sysIDWot)) {
            if (gs.nil(wot.dispatch_group)) {
                if (gs.nil(wot.territory)) {
                    return this.generateResponseWithCode_CreateWOT(202, false, this.EMPTY_TERRITORY, this.getJsonData(wot.sys_id, 'wm_task'), 'validation-error');
                } else {
                    var fsmTerritoryApi = new sn_fsm_tp.FieldServiceTerritoryPlanning();
                    var dispatchQueue = new global.SMConfigurationHelper().isEnabled(wot, 'dispatch_queue', false);
                    var matchingDispatchGroups = fsmTerritoryApi.getGroupsByTerritory(wot.territory.toString(), 'wm_dispatch');
                    if (matchingDispatchGroups.length == 0) {
                        return this.generateResponseWithCode_CreateWOT(202, false, this.NO_DISPATCH_GROUP, this.getJsonData(wot.sys_id, 'wm_task'), 'validation-error');
                    } else {
                        wot.setValue('dispatch_group', matchingDispatchGroups[0]);
                        wot.update();
                        var updateData = {
                            sys_id: wot.sys_id,
                            state: 10
                        };
                    }
                    this.updateWOTState(updateData);

                }
            } else {
                wot.setValue('state', 10); //Pending dispatch state
                if (gs.nil(wot.update())) {
                    return this.generateResponseWithCode_CreateWOT(500, false, this.UPDATE_ERROR_WOT, this.getJsonData(wot.sys_id, 'wm_task'));
                }
            }
            return this.generateResponseWithCode_CreateWOT(200, true, this.MESSAGE_SUCCESS, this.getJsonData(wot.sys_id, 'wm_task'));

        }
    },
    createAppointment: function(payload) {
        var result_global = {};
        var templateID = payload.template ? payload.template : null;
        var workOrderID = payload.parent ? payload.parent : null;
        var locationID = payload.location ? payload.location : null;
        var windowStart = payload.window_start ? payload.window_start : null;

        var request_data = payload;

        var startDate = request_data.startDateUTC ? request_data.startDateUTC : null;
        var endDate = request_data.endDateUTC ? request_data.endDateUTC : null;
        var actualStartDate = request_data.actualStartDate ? request_data.actualStartDate : null;
        var actualEndDate = request_data.actualEndDate ? request_data.actualEndDate : null;
        var timezone = request_data.timezone ? request_data.timezone : null;
        var catalogId = request_data.catalogId ? request_data.catalogId : null;
        // var taskId = request_data.taskId ? request_data.taskId : null;
        var openedFor = request_data.openedFor ? request_data.openedFor : null;
        var location = request_data.location ? request_data.location : null;
        //var reschedule = request_data.reschedule;
        //var task_table = request_data.taskTable ? request_data.taskTable : null;
        var service_config_rule = request_data.service_config_rule ? request_data.service_config_rule : null;

        if (gs.nil(location)) return this.generateResponseWithCode_CreateWOT(404, false, this.LOCATION_ID_MISSING);
        else if (this.verifyLocation(location) == false) return this.generateResponseWithCode_CreateWOT(404, false, this.LOCATION_ID_NOT_FOUND);

        if (gs.nil(catalogId)) return this.generateResponseWithCode_CreateWOT(404, false, this.CATALOG_ID_MISSING);
        else if (this.verifyCatalog(catalogId) == false) return this.generateResponseWithCode_CreateWOT(404, false, this.CATALOG_ID_NOT_FOUND);

        if (gs.nil(service_config_rule)) return this.generateResponseWithCode_CreateWOT(404, false, this.CONFIG_RULE_MISSING);
        else if (this.verifyConfigRule(service_config_rule) == false) return this.generateResponseWithCode_CreateWOT(404, false, this.CONFIG_RULE_NOT_FOUND);

        if (gs.nil(openedFor)) return this.generateResponseWithCode_CreateWOT(404, false, this.OPEN_FOR_MISSING);
        else if (this.verifyOpenFor(openedFor) == false) return this.generateResponseWithCode_CreateWOT(404, false, this.OPEN_FOR_NOT_FOUND);

        if (gs.nil(startDate)) return this.generateResponseWithCode_CreateWOT(404, false, this.START_DATE_MISSING);
        if (gs.nil(actualStartDate)) return this.generateResponseWithCode_CreateWOT(404, false, this.ACTUAL_START_DATE_MISSING);
        if (gs.nil(endDate)) return this.generateResponseWithCode_CreateWOT(404, false, this.END_DATE_MISSING);
        if (gs.nil(actualEndDate)) return this.generateResponseWithCode_CreateWOT(404, false, this.ACTUAL_END_DATE_MISSING);
        if (gs.nil(timezone)) return this.generateResponseWithCode_CreateWOT(404, false, this.TIMEZONE_MISSING);


        var appointment_object = {
            "config": {
                "taskTable": task_table
            },
            "selectedWindow": {
                "actualStartUTC": startDate,
                "actualEndUTC": endDate,
                "actualStart": actualStartDate,
                "actualEnd": actualEndDate,
                "timezone": timezone,
                "recordProducer": catalogId
            },
            "ruleId": service_config_rule
        };
        var appointmentBooking = new sn_apptmnt_booking.AppointmentBookingImpl();

        var grWmOrderTask = new GlideRecord('wm_task');
        grWmOrderTask.initialize();

        // Insert mandatories fields
        grWmOrderTask.template = templateID;
        grWmOrderTask.location = locationID;
        grWmOrderTask.parent = workOrderID;
        grWmOrderTask.window_start = windowStart;
        if (request_data.correlation_id)
            grWmOrderTask.correlation_id = request_data.correlation_id;
        if (request_data.correlation_display)
            grWmOrderTask.correlation_display = request_data.correlation_display;

        var taskid = grWmOrderTask.insert();
        result_global.wot = this.getJsonData(taskid, 'wm_task');
        var task_table = "wm_task";

        var result = appointmentBooking.submitAppointmentFromPlatform(appointment_object, taskid, task_table, catalogId, openedFor, location);
        result_global.appointment_booking = result;
        return this.generateResponse(result.success, result.reason, result_global);
    },
    cancelWOT: function(data) {
        var bellErrUtil = new FSMBellInternalErrorUtil();
        var wot = new GlideRecord('wm_task');

        if (wot.get(data.sys_id)) {

            if (wot.state == 7) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "validation-error",
                    this.WOT_ALREADY_CANCELLED, {},
                    bellErrUtil.buildCausedBy(this.WOT_ALREADY_CANCELLED)
                );
            } else {

                if (wot.parent.state == 1) {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        400,
                        "validation-error",
                        this.WOT_PARENT_DRAFT, {},
                        bellErrUtil.buildCausedBy(this.WOT_PARENT_DRAFT)
                    );
                }

                wot.state = 7;
                wot.work_notes = "Work order task Cancelled by API WOM FSM";
                var res = wot.update();

                if (gs.nil(res)) {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        500,
                        "unexpected-server-error",
                        this.SOMETHING_WENT_WRONG, {},
                        bellErrUtil.buildCausedBy(this.SOMETHING_WENT_WRONG)
                    );
                } else {
                    // ✅ SUCCESS PATH — UNCHANGED
                    return this.generateResponseWithCode(
                        200,
                        true,
                        this.CANCEL_SUCESS,
                        this.getJsonData(res, 'wm_task')
                    );
                }
            }
        } else {
            return bellErrUtil.generateBellInternalErrorResponse(
                404,
                "property-invalid",
                this.WOT_ID_NOT_FOUND, {},
                bellErrUtil.buildCausedBy(this.WOT_ID_NOT_FOUND)
            );
        }
    },
    updateWOTState: function(data) {
        var bellErrUtil = new FSMBellInternalErrorUtil();
        var wot = new GlideRecord('wm_task');
        var state = data.state;

        if ((state == 4 || state == 3) && gs.nil(data.work_notes)) {
            return bellErrUtil.generateBellInternalErrorResponse(
                400,
                "property-missing",
                this.WORK_NOTES_MANDATORY, {},
                bellErrUtil.buildCausedBy(this.WORK_NOTES_MANDATORY)
            );
        }

        if (wot.get(data.sys_id)) {
            wot.setValue('state', state);

            if (!gs.nil(data.work_notes)) {
                wot.work_notes = data.work_notes;
            }

            var res = wot.update();

            if (gs.nil(res)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    202,
                    "unexpected-server-error",
                    this.SOMETHING_WENT_WRONG, {},
                    bellErrUtil.buildCausedBy(this.SOMETHING_WENT_WRONG)
                );
            } else {
                return this.generateResponseWithCode(
                    200,
                    true,
                    this.WOT_STATE_UPDATE_SUCCESS,
                    this.getJsonData(res, 'wm_task')
                );
            }

        } else {
            return bellErrUtil.generateBellInternalErrorResponse(
                404,
                "property-invalid",
                this.WOT_ID_NOT_FOUND, {},
                bellErrUtil.buildCausedBy(this.WOT_ID_NOT_FOUND)
            );
        }
    },
    updateStateAfterWOTCreate: function(state, wot) {
        if (state) {
            if (state == 7) {
                wot.work_notes = "Work order task Cancelled by API WOM FSM";
            }
            if (state == 4 || state == 3) {
                wot.work_notes = "Work order task Closed by API WOM FSM";
            }
            var stateFlowId = this.findStateFlow(wot.state, state);
            if (stateFlowId != null) {
                new global.StateFlow().processFlow(wot, stateFlowId, 'manual');
            } else {
                wot.state = state;
            }
        }
    },
    updateWOT: function(data) {
        var result_wot = "";
        var bellErrUtil = new FSMBellInternalErrorUtil();

        gs.info(JSON.stringify(data), "WOMIntegrationState");
        var wot_parent;
        var wo_sys_id;
        var response = {};

        //return this.generateResponseWithCode_CreateWOT(404, false, data.hasOwnProperty("correlation_id"), '', 'property-invalid');
        if (gs.nil(data.sys_id))
            return bellErrUtil.generateBellInternalErrorResponse(
                400,
                "property-missing",
                this.WOT_ID_MISSING, {},
                bellErrUtil.buildCausedBy(this.WOT_ID_MISSING)
            );
        else {
            var grWmTask = new GlideRecord('wm_task');
            if (grWmTask.get(data.sys_id)) {
                this.WOT_INITIAL = grWmTask;
            }
        }

        if (data.hasOwnProperty("external_ids") && gs.nil(this.getRefData_ExternalId(data.external_ids)))
            return bellErrUtil.generateBellInternalErrorResponse(
                400,
                "property-invalid",
                this.REF_DATA_EXTERNAL_ID_NOT_VALID, {},
                bellErrUtil.buildCausedBy(this.REF_DATA_EXTERNAL_ID_NOT_VALID)
            );

        // related_contacts validation (optional field; null means "remove all", validate only when non-null)
        if (data.hasOwnProperty("related_contacts") && !gs.nil(data.related_contacts)) {
            if (!this.validateRelatedContacts(data.related_contacts)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-invalid",
                    this.RELATED_CONTACTS_NOT_FOUND_UPDATE, {},
                    bellErrUtil.buildCausedBy(this.RELATED_CONTACTS_NOT_FOUND_UPDATE)
                );
            }
        }

        // priority validation (optional field; validate only if present)
        if (Object.prototype.hasOwnProperty.call(data, "priority")) {

            // present but empty/blank
            if (gs.nil(data.priority) || ("" + data.priority).trim() === "") {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-missing",
                    this.PRIORITY_MISSING, {},
                    bellErrUtil.buildCausedBy(this.PRIORITY_MISSING)
                );
            }

            // present and non-empty but invalid
            if (this.isValidPriority(data.priority) == false) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-invalid",
                    this.PRIORITY_NOT_fOUND, {},
                    bellErrUtil.buildCausedBy(this.PRIORITY_NOT_fOUND)
                );
            }
        }

        //state 
        if (!gs.nil(data.state) && !this.isValidState(data.state, "update")) {
            return bellErrUtil.generateBellInternalErrorResponse(
                404,
                "property-invalid",
                this.STATE_NOT_FOUND, {},
                bellErrUtil.buildCausedBy(this.STATE_NOT_FOUND)
            );
        }

        // correlation id

        if (!data.hasOwnProperty("correlation_id")) {
            return bellErrUtil.generateBellInternalErrorResponse(
                400,
                "property-missing",
                this.CORRELATION_ID_MISSING, {},
                bellErrUtil.buildCausedBy(this.CORRELATION_ID_MISSING)
            );
        }
        if (gs.nil(data.correlation_id.trim()))
            return bellErrUtil.generateBellInternalErrorResponse(
                400,
                "property-invalid",
                this.CORRELATION_ID_INVALID, {},
                bellErrUtil.buildCausedBy(this.CORRELATION_ID_INVALID)
            );

        //verifiy date time
        if (data.hasOwnProperty("window_start") && data.window_start !== "" && !this.isValidDateTime(data.window_start)) {
            return bellErrUtil.generateBellInternalErrorResponse(
                400,
                "property-invalid",
                this.WINDOW_START_INVALID, {},
                bellErrUtil.buildCausedBy(this.WINDOW_START_INVALID)
            );
        }
        if (!gs.nil(data.window_end) && !this.isValidDateTime(data.window_end)) {
            return bellErrUtil.generateBellInternalErrorResponse(
                400,
                "property-invalid",
                this.WINDOW_END_INVALID, {},
                bellErrUtil.buildCausedBy(this.WINDOW_END_INVALID)
            );
        }
        if (data.hasOwnProperty("estimated_work_duration") && data.estimated_work_duration !== "" && !this.isValidDuration(data.estimated_work_duration)) {
            return bellErrUtil.generateBellInternalErrorResponse(
                400,
                "property-invalid",
                this.ESTIMATED_WORK_INVALID, {},
                bellErrUtil.buildCausedBy(this.ESTIMATED_WORK_INVALID)
            );
        }

        if (!gs.nil(data.u_external_appointment_start_time) && !this.isValidDateTime(data.u_external_appointment_start_time)) {
            return bellErrUtil.generateBellInternalErrorResponse(
                400,
                "property-invalid",
                this.EXTERNAL_APPOINTMENT_START_TIME, {},
                bellErrUtil.buildCausedBy(this.EXTERNAL_APPOINTMENT_START_TIME)
            );
        }

        if (!gs.nil(data.u_external_appointment_end_time) && !this.isValidDateTime(data.u_external_appointment_end_time)) {
            return bellErrUtil.generateBellInternalErrorResponse(
                400,
                "property-invalid",
                this.EXTERNAL_APPOINTMENT_END_TIME, {},
                bellErrUtil.buildCausedBy(this.EXTERNAL_APPOINTMENT_END_TIME)
            );
        }

        // Parent Work order
        if (!gs.nil(data.parent) && !this.verifyWO(data.parent)) {
            return bellErrUtil.generateBellInternalErrorResponse(
                404,
                "property-invalid",
                this.WO_ID_NOT_FOUND, {},
                bellErrUtil.buildCausedBy(this.WO_ID_NOT_FOUND)
            );
        }

        //NOVA 1591 ****************************************************************************************************************************************************************************
        // if (data.hasOwnProperty("u_associated_order_ids") && gs.nil(data.u_associated_order_ids))
        //     return bellErrUtil.generateBellInternalErrorResponse(
        //         404,
        //         "property-invalid",
        //         this.ASSOCIATE_ORDER_EMPTY,
        //         {},
        //         bellErrUtil.buildCausedBy(this.ASSOCIATE_ORDER_EMPTY)
        //     );

        if (!gs.nil(data.u_installation_type) && this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_installation_type^code=" + data.u_installation_type) == -1)
            return bellErrUtil.generateBellInternalErrorResponse(
                404,
                "property-invalid",
                this.INSTALLATION_TYPE_NOT_FOUND, {},
                bellErrUtil.buildCausedBy(this.INSTALLATION_TYPE_NOT_FOUND)
            );


        if (!gs.nil(data.u_jeopardy_state) && data.u_jeopardy_state.length !== 0 && this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_jeopardy_state^code=" + data.u_jeopardy_state) == -1)
            return bellErrUtil.generateBellInternalErrorResponse(
                404,
                "property-invalid",
                this.JEOPARTY_STATE_NOT_FOUND, {},
                bellErrUtil.buildCausedBy(this.JEOPARTY_STATE_NOT_FOUND)
            );

        if (!gs.nil(data.u_rule_violations) &&
            this.getReferenceData("x_bellc_fsm_consumed_dictionary",
                "active=true^target_field=u_rule_violations^codeIN" + data.u_rule_violations,
                data.u_rule_violations) == -1)
            return bellErrUtil.generateBellInternalErrorResponse(
                404,
                "property-invalid",
                this.RULE_VIOLATION_NOT_FOUND, {},
                bellErrUtil.buildCausedBy(this.RULE_VIOLATION_NOT_FOUND)
            );
        //Commented out so it can be possible to clear job classification values
        // if (data.hasOwnProperty("u_job_classification") && gs.nil(data.u_job_classification))
        //     return bellErrUtil.generateBellInternalErrorResponse(
        //         400,
        //         "property-missing",
        //         this.JOB_CLASSIFICATION_EMPTY, {},
        //         bellErrUtil.buildCausedBy(this.JOB_CLASSIFICATION_EMPTY)
        //     );

        if (!gs.nil(data.u_job_classification) && this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_job_classification^code=" + data.u_job_classification) == -1)
            return bellErrUtil.generateBellInternalErrorResponse(
                404,
                "property-invalid",
                this.JOB_CLASSIFICATION_NOT_FOUND, {},
                bellErrUtil.buildCausedBy(this.JOB_CLASSIFICATION_NOT_FOUND)
            );

        if (!gs.nil(data.u_material_status) && this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_material_status^code=" + data.u_material_status) == -1)
            return bellErrUtil.generateBellInternalErrorResponse(
                404,
                "property-invalid",
                this.MATERIAL_STATUS_NOT_FOUND, {},
                bellErrUtil.buildCausedBy(this.MATERIAL_STATUS_NOT_FOUND)
            );

        if (!gs.nil(data.u_req_rdd_appt_start) && !this.isValidDateTime(data.u_req_rdd_appt_start)) {
            return bellErrUtil.generateBellInternalErrorResponse(
                400,
                "property-invalid",
                "Customer RDD Appointment Start invalid Date", {},
                bellErrUtil.buildCausedBy("Customer RDD Appointment Start invalid Date")
            );
        }

        if (!gs.nil(data.u_req_rdd_appt_end) && !this.isValidDateTime(data.u_req_rdd_appt_end)) {
            return bellErrUtil.generateBellInternalErrorResponse(
                400,
                "property-invalid",
                "Customer RDD Appointment End  invalid Date", {},
                bellErrUtil.buildCausedBy("Customer RDD Appointment End  invalid Date")
            );
        }

        // if (data.hasOwnProperty("u_task_type") && gs.nil(data.u_task_type))
        //     return bellErrUtil.generateBellInternalErrorResponse(
        //         400,
        //         "property-missing",
        //         "Task Type empty", {},
        //         bellErrUtil.buildCausedBy("Task Type empty")
        //     );

        if (!gs.nil(data.u_task_type) && this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_task_type^code=" + data.u_task_type) == -1)
            return bellErrUtil.generateBellInternalErrorResponse(
                404,
                "property-invalid",
                "Task Type not Found", {},
                bellErrUtil.buildCausedBy("Task Type not Found")
            );

        if (!gs.nil(data.u_work_type_action) && this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_work_type_action^code=" + data.u_work_type_action) == -1)
            return bellErrUtil.generateBellInternalErrorResponse(
                404,
                "property-invalid",
                "Task Type Action not Found", {},
                bellErrUtil.buildCausedBy("Task Type Action not Found")
            );

        if (!gs.nil(data.u_plant_ready_date) && !this.isValidDateTime(data.u_plant_ready_date))
            return bellErrUtil.generateBellInternalErrorResponse(
                400,
                "property-invalid",
                "Plant Ready Date invalid Date", {},
                bellErrUtil.buildCausedBy("Plant Ready Date invalid Date")
            );

        if (!gs.nil(data.u_plant_test_date) && !this.isValidDateTime(data.u_plant_test_date)) {
            return bellErrUtil.generateBellInternalErrorResponse(
                400,
                "property-invalid",
                "Plant Test Date invalid Date", {},
                bellErrUtil.buildCausedBy("Plant Test Date invalid Date")
            );
        }

        if (!gs.nil(data.u_source_received_date) && !this.isValidDateTime(data.u_source_received_date))
            return bellErrUtil.generateBellInternalErrorResponse(
                400,
                "property-invalid",
                "Source Received Date invalid Date", {},
                bellErrUtil.buildCausedBy("Source Received Date invalid Date")
            );

        if (!gs.nil(data.u_extension_duration) && !this.isValidDuration(data.u_extension_duration))
            return bellErrUtil.generateBellInternalErrorResponse(
                400,
                "property-invalid",
                "Extension Duration invalid time", {},
                bellErrUtil.buildCausedBy("Extension Duration invalid time")
            );

        if (!gs.nil(data.u_perceived_severity) && this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_perceived_severity^code=" + data.u_perceived_severity) == -1)
            return bellErrUtil.generateBellInternalErrorResponse(
                404,
                "property-invalid",
                "Perceived Severity not Found", {},
                bellErrUtil.buildCausedBy("Perceived Severity not Found")
            );

        var wot = new GlideRecord('wm_task');
        if (wot.get(data.sys_id)) {
            // check Location 
            //gs.info("global.WOMUtils2 debugWOM" + new global.WOMUtils2().validate_group_assign_territory(wot));

            var skills;

            if (data.hasOwnProperty("skills")) {
                if (Array.isArray(data.skills) && data.skills.length === 0) {
                    // Empty array = reset skills (will be handled later in update)
                    skills = {
                        valid: true,
                        reset: true
                    };
                } else {
                    skills = this.isValidSkill(data.skills);
                    if (skills.valid == false) {
                        return bellErrUtil.generateBellInternalErrorResponse(
                            skills.code,
                            skills.errorCode,
                            skills.message, {},
                            bellErrUtil.buildCausedBy(skills.message)
                        );
                    }
                }
            }

            //check jeopardy_state
            if (data.hasOwnProperty("u_jeopardy_state") && data.u_jeopardy_state.length === 0) {
                wot.u_jeopardy_state = "";
            }


            // check correlation id 

            if (data.correlation_id != data.correlation_id)
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "validation-error",
                    this.CORRELATION_ID_NOT_MATCH, {},
                    bellErrUtil.buildCausedBy(this.CORRELATION_ID_NOT_MATCH)
                );

            // Cancel a WOT
            if (wot.state == 7 && data.state == 7) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "validation-error",
                    this.WOT_ALREADY_CANCELLED, {},
                    bellErrUtil.buildCausedBy(this.WOT_ALREADY_CANCELLED)
                );
            }

            //check if window_end is before window_start
            var windowEnd = data.window_end ? data.window_end : wot.window_end;
            var windowStart = data.window_start ? data.window_start : wot.window_start;

            windowEnd = windowEnd ? windowEnd : null;
            windowStart = windowStart ? windowStart : null;

            if (windowEnd != null && windowStart != null) {
                var win_end = new GlideDateTime(windowEnd);
                var win_start = new GlideDateTime(windowStart);
                if (win_end < win_start) {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        400,
                        "validation-error",
                        this.WOT_WINDOW_END_AFTER_WINDOW_START, {},
                        bellErrUtil.buildCausedBy(this.WOT_WINDOW_END_AFTER_WINDOW_START)
                    );
                }
            }

            if (Object.prototype.hasOwnProperty.call(data, "location")) {

                // EMPTY / WRONG TYPE
                if (typeof data.location !== "string" || data.location.trim() === "") {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        400,
                        "property-missing",
                        this.LOCATION_ID_MISSING, {},
                        bellErrUtil.buildCausedBy(this.LOCATION_ID_MISSING)
                    );
                }

                // NOT FOUND
                if (!this.verifyLocation(data.location)) {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        404,
                        "property-invalid",
                        this.LOCATION_ID_NOT_FOUND, {},
                        bellErrUtil.buildCausedBy(this.LOCATION_ID_NOT_FOUND)
                    );
                }

                // TERRITORY + DISPATCH GROUP VALIDATIONS
                var territory = this.locationWithTerritory(wot, data.location);
                if (territory.success == false) {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        400,
                        "validation-error",
                        this.EMPTY_TERRITORY + JSON.stringify(territory), {},
                        bellErrUtil.buildCausedBy(this.EMPTY_TERRITORY + JSON.stringify(territory))
                    );
                }

                if (this.checkAssignGroupforTerritory(territory) == false) {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        400,
                        "validation-error",
                        this.NO_DISPATCH_GROUP, {},
                        bellErrUtil.buildCausedBy(this.NO_DISPATCH_GROUP)
                    );
                }

                // ASSIGN (after everything passes)
                wot.location = data.location;
            }
            var taskSkill = this.getTaskSkills(wot.sys_id);
            if (Object.prototype.hasOwnProperty.call(data, "template")) {

                // EMPTY / WRONG TYPE
                if (typeof data.template !== "string" || data.template.trim() === "") {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        400,
                        "property-missing",
                        this.TEMPLATE_ID_MISSING, {},
                        bellErrUtil.buildCausedBy(this.TEMPLATE_ID_MISSING)
                    );
                }

                // NOT FOUND (your existing verification)
                if (!this.verifyTemplateWOT(data.template)) {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        404,
                        "property-invalid", // if you have "property-not-found", that would be better
                        this.TEMPLATE_ID_NOT_FOUND, {},
                        bellErrUtil.buildCausedBy(this.TEMPLATE_ID_NOT_FOUND)
                    );
                }

                // ASSIGN
                wot.template = data.template; // confirm this is the correct target field
            }

            if (Object.prototype.hasOwnProperty.call(data, "parent")) {

                if (typeof data.parent !== "string" || data.parent.trim() === "") {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        400,
                        "property-missing",
                        this.WO_ID_MISSING, {},
                        bellErrUtil.buildCausedBy(this.WO_ID_MISSING)
                    );
                }

                // optional: parent existence check -> WO_ID_NOT_FOUND

                wot.parent = data.parent; // adjust field name if different
            }
            if (!gs.nil(data.u_code_reason) && this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_code_reason^code=" + data.u_code_reason) == -1) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-invalid",
                    this.REASON_CODE_NOT_FOUND, {},
                    bellErrUtil.buildCausedBy(this.REASON_CODE_NOT_FOUND)
                );
            }

            //check if wot has parent wo
            if (gs.nil(wot.parent) && !data.parent) {
                var parent_wo = new GlideRecord('wm_order');
                parent_wo.initialize();
                parent_wo.short_description = wot.short_description ? wot.short_description : 'WO created by API update WOT number: ' + wot.number;
                parent_wo.location = wot.location;
                wo_sys_id = parent_wo.insert();
                if (gs.nil(wo_sys_id)) {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        500,
                        "validation-error",
                        this.SOMETHING_WENT_WRONG, {},
                        bellErrUtil.buildCausedBy(this.SOMETHING_WENT_WRONG)
                    );
                } else {
                    wot.parent = wo_sys_id;
                }
            }

            if (data.window_start != null) {
                wot.window_start = data.window_start;
            }
            if (data.window_end != null) {
                wot.window_end = data.window_end;
            }

            if (data.priority) {
                if (this.isValidPriority(data.priority)) {
                    wot.priority = data.priority;
                }
            }

            if (data.hasOwnProperty("description")) {
                wot.description = data.description;
            }

            if (data.correlation_id) {
                wot.correlation_id = data.correlation_id;
            }
            if (data.hasOwnProperty("correlation_display")) {
                wot.correlation_display = data.correlation_display;
            }

            if (data.hasOwnProperty("due_date")) {
                wot.due_date = data.due_date;
            }
            if (data.hasOwnProperty("estimated_work_duration")) {

                if (typeof data.estimated_work_duration !== "string" ||
                    data.estimated_work_duration.trim() === "") {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        400,
                        "property-missing",
                        this.ESTIMATED_WORK_MISSING, {}, // or MISSING if you must reuse it
                        bellErrUtil.buildCausedBy(this.ESTIMATED_WORK_MISSING)
                    );
                }
                wot.estimated_work_duration = data.estimated_work_duration;
            }
            // if (data.needs_appointment) {
            //     wot.needs_appointment = data.needs_appointment;
            // }
            if (data.u_external_appointment_end_time != null && data.u_external_appointment_start_time != null) {
                var appt_end = new GlideDateTime(data.u_external_appointment_end_time);
                var appt_start = new GlideDateTime(data.u_external_appointment_start_time);
                if (appt_end < appt_start) {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        400,
                        "validation-error",
                        this.WOT_APPT_END_AFTER_APPT_START, {},
                        bellErrUtil.buildCausedBy(this.WOT_APPT_END_AFTER_APPT_START)
                    );
                }
            }
            if (data.hasOwnProperty("u_external_appointment_start_time")) {
                wot.u_external_appointment_start_time = data.u_external_appointment_start_time;
            }
            if (data.hasOwnProperty("u_external_appointment_end_time")) {
                wot.u_external_appointment_end_time = data.u_external_appointment_end_time;
            }
            if (data.hasOwnProperty("u_external_appointment_id")) {
                wot.u_external_appointment_id = data.u_external_appointment_id;
            }
            if (data.hasOwnProperty("has_external_appointment")) {
                wot.has_external_appointment = data.has_external_appointment;
            }
            if (Object.prototype.hasOwnProperty.call(data, "short_description")) {

                if (typeof data["short_description"] !== "string" ||
                    data["short_description"].trim() === "") {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        400,
                        "property-missing",
                        this.SHORT_DESCRIPTION_MISSING, {},
                        bellErrUtil.buildCausedBy(this.SHORT_DESCRIPTION_MISSING)
                    );
                }

                wot.short_description = data["short_description"]; // adjust mapping if needed
            }

            /*if (data.state) {
                var state = data.state;
                if (state == 7) {
                    wot.work_notes = "Work order task Cancelled by API WOM FSM";
                }
                if (state == 4 || state == 3) {
                    wot.work_notes = "Work order task Closed by API WOM FSM";
                }
                var stateFlowId = this.findStateFlow(wot.state, state);
                if (stateFlowId != null) {
                    new global.StateFlow().processFlow(wot, stateFlowId, 'automatic');
                } else {
                    wot.state = state;
                }
            }*/

            //NOVA-439 extend time on job
            if (data.planned_work_duration) {
                wot.planned_work_duration = data.planned_work_duration;
            }

            if (!gs.nil(data.u_code_reason))
                wot.u_code_reason = this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_code_reason^code=" + data.u_code_reason);

            // var res = wot.update();
            // var updatewotSuccess = this.changeWotState(wot, data.state, data.substate);
            // gs.info("WOT id: " + wot.sys_id + "State: " + data.state + ", Substate: " + data.substate + " update succes" + JSON.stringify(updatewotSuccess), "WOT INTEGRATION")
            // //if (gs.nil(updatewotSuccess)) {
            // if (updatewotSuccess.success == false) {
            //     //return this.generateResponseWithCode(500, false, this.SOMETHING_WENT_WRONG);
            //     return this.generateResponseWithCode(400, false, updatewotSuccess.message, '', updatewotSuccess.errorCode);
            // } else {

            // NOVA 1591**********************************************************************************************************************************************************

            if (data.hasOwnProperty("u_associated_order_ids")) {
                wot.u_associated_order_ids = data.u_associated_order_ids; // "" will reset
            }

            if (data.hasOwnProperty("u_installation_type")) {
                wot.u_installation_type = data.u_installation_type;
            }
            if (data.hasOwnProperty("u_is_cancelled_from_source")) {
                wot.u_is_cancelled_from_source = data.u_is_cancelled_from_source;
            }
            if (data.hasOwnProperty("u_jeopardy_state") && data.u_jeopardy_state.length !== 0) {
                wot.u_jeopardy_state = this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_jeopardy_state^code=" + data.u_jeopardy_state).toString();

            }
            if (data.hasOwnProperty("u_rule_violations")) {
                if (data.u_rule_violations === "") {
                    wot.u_rule_violations = ""; // Reset
                } else {
                    wot.u_rule_violations = this.getReferenceData(
                        "x_bellc_fsm_consumed_dictionary",
                        "active=true^target_field=u_rule_violations^codeIN" + data.u_rule_violations,
                        data.u_rule_violations
                    ).toString();
                }
            }
            if (data.hasOwnProperty("u_job_classification")) {
                wot.u_job_classification = data.u_job_classification;
            }
            if (data.hasOwnProperty("u_material_status")) {
                wot.u_material_status = data.u_material_status;
            }

            if (data.hasOwnProperty("u_pattern")) {
                wot.u_pattern = data.u_pattern;
            }

            if (data.hasOwnProperty("u_req_rdd_appt_start")) {
                wot.u_req_rdd_appt_start = data.u_req_rdd_appt_start;
            }
            if (data.hasOwnProperty("u_req_rdd_appt_end")) {
                wot.u_req_rdd_appt_end = data.u_req_rdd_appt_end;
            }
            if (data.hasOwnProperty("u_service_tn")) {
                wot.u_service_tn = data.u_service_tn;
            }
            if (data.hasOwnProperty("u_source_clli")) {
                wot.u_source_clli = data.u_source_clli;
            }
            if (data.hasOwnProperty("u_source_order_id")) {
                wot.u_source_order_id = data.u_source_order_id;
            }
            if (data.hasOwnProperty("u_source_task_id")) {
                wot.u_source_task_id = data.u_source_task_id;
            }
            if (data.hasOwnProperty("u_task_type")) {
                wot.u_task_type = data.u_task_type;
            }
            if (data.hasOwnProperty("u_work_type_action")) {
                wot.u_work_type_action = data.u_work_type_action;
            }

            if (data.hasOwnProperty("u_is_service_affecting")) {
                wot.u_is_service_affecting = data.u_is_service_affecting;
            }
            if (data.hasOwnProperty("u_plant_ready_date")) {
                wot.u_plant_ready_date = data.u_plant_ready_date;
            }
            if (data.hasOwnProperty("u_plant_test_date")) {
                wot.u_plant_test_date = data.u_plant_test_date;
            }
            if (data.hasOwnProperty("u_source_received_date")) {
                wot.u_source_received_date = data.u_source_received_date;
            }
            if (data.hasOwnProperty("u_extension_duration")) {
                wot.u_extension_duration = data.u_extension_duration;
            }
            if (data.hasOwnProperty("u_perceived_severity")) {
                wot.u_perceived_severity = data.u_perceived_severity;
            }
            if (data.hasOwnProperty("u_has_helper_task")) {
                wot.u_has_helper_task = data.u_has_helper_task;
            }

            // market type
            if (!gs.nil(data.u_market_type) && this.getReferenceData("x_bellc_fsm_consumed_dictionary", "active=true^target_field=u_market_type^code=" + data.u_market_type) != -1)
                wot.u_market_type = data.u_market_type;
            // reset data
            if (data.hasOwnProperty("u_market_type") && gs.nil(data.u_market_type)) wot.u_market_type = "";

            if (data.hasOwnProperty("u_mh_pick_up")) {
                if (data.u_mh_pick_up !== "true" && data.u_mh_pick_up !== "false" && data.u_mh_pick_up !== "") {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        400,
                        "property-invalid",
                        this.MH_PICK_UP_INVALID, {},
                        bellErrUtil.buildCausedBy(this.MH_PICK_UP_INVALID)
                    );
                }
                wot.u_mh_pick_up = data.u_mh_pick_up === "" ? "" : data.u_mh_pick_up;
            }

            //end NOVA 1591**********************************************************************************************************************************************************
            var assignedTo = data.assigned_to;
            if (!gs.nil(assignedTo) && !this.verifyAssignedTo(assignedTo)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    404,
                    "property-invalid",
                    this.ASSIGNED_TO_NOT_FOUND, {},
                    bellErrUtil.buildCausedBy(this.ASSIGNED_TO_NOT_FOUND)
                );
            }

            if (!gs.nil(data.expected_start) && !this.isValidDateTime(data.expected_start)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-invalid",
                    this.EXPECTED_START_INVALID, {},
                    bellErrUtil.buildCausedBy(this.EXPECTED_START_INVALID)
                );
            }

            if (!gs.nil(data.expected_start)) {
                var winStart;
                var expectStart = new GlideDateTime(data.expected_start);
                if (!gs.nil(wot.window_start)) {
                    winStart = new GlideDateTime(wot.window_start);
                    if (winStart > expectStart) {
                        return bellErrUtil.generateBellInternalErrorResponse(
                            400,
                            "validation-error",
                            "Window start should be before Scheduled start", {},
                            bellErrUtil.buildCausedBy("Window start should be before Scheduled start")
                        );
                    }
                }
                if (gs.nil(assignedTo)) {
                    wot.expected_start = data.expected_start;
                }
            }

            if (!gs.nil(assignedTo) && gs.nil(wot.territory)) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "validation-error",
                    this.EMPTY_TERRITORY, {},
                    bellErrUtil.buildCausedBy(this.EMPTY_TERRITORY)
                );
            }
            if (!gs.nil(assignedTo) && gs.nil(wot.assignment_group) && gs.nil(this.getAssignmentGroup(wot))) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "validation-error",
                    this.NO_ASSIGNMENT_GROUP, {},
                    bellErrUtil.buildCausedBy(this.NO_ASSIGNMENT_GROUP)
                );
            }
            if (!gs.nil(assignedTo) && !gs.nil((this.getAssignmentGroup(wot))) && !this.checkUserMembership(assignedTo, this.getAssignmentGroup(wot))) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "validation-error",
                    this.USER_NOT_MEMBER_OF_ASSIGN_GROUP, {},
                    bellErrUtil.buildCausedBy(this.USER_NOT_MEMBER_OF_ASSIGN_GROUP)
                );
            }

            if (!gs.nil(assignedTo)) {
                this.addAssignedTo(wot.sys_id, assignedTo, wot.assignment_group, data.expected_start, wot);
            }

            if (data.hasOwnProperty("u_amalgamated_ids")) {
                wot.u_amalgamated_ids = data.u_amalgamated_ids; // "" will reset
            }

            // Check Date
            var checkDate_return = this.checkDate(wot);
            gs.info("checkDate_return " + JSON.stringify(checkDate_return));
            if (checkDate_return.success == false) return checkDate_return.response;
            if (!gs.nil(wot.assigned_to) && new global.SMDateValidation()._checkAgentSchedulingConflict(wot, wot.assigned_to) == false) {
                //if(new global.SMDateValidation()._checkAgentSchedulingConflict(wot, wot.assigned_to) == false){
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "validation-error",
                    this.TECHNICIAN_NOT_AVAILABLE, {},
                    bellErrUtil.buildCausedBy(this.TECHNICIAN_NOT_AVAILABLE)
                );
            }

            // state
            var global_result_state_wot = "";
            if (!gs.nil(data.state)) {

                //NOVA 1578
                var listStateNeed = [10, 3, 4, 17, 18];
                var valueState = Number(data.state);
                if (this.transitionStateValid(Number(wot.state), valueState).code == false)
                    return bellErrUtil.generateBellInternalErrorResponse(
                        400,
                        "validation-error",
                        this.transitionStateValid(Number(wot.state), valueState).message, {},
                        bellErrUtil.buildCausedBy(this.transitionStateValid(Number(wot.state), valueState).message)
                    );
                var updatewotSuccess = this.changeWotState(wot, data.state, this.getSubstate(data.state));
                global_result_state_wot = updatewotSuccess;

                if (updatewotSuccess.success == false) {

                    return bellErrUtil.generateBellInternalErrorResponse(
                        400,
                        updatewotSuccess.errorCode,
                        updatewotSuccess.message, {},
                        bellErrUtil.buildCausedBy(updatewotSuccess.message)
                    );
                }
                //wot.state = data.state;
            }
            var validTechPref;
            if (data.task_tech_preference) {
                validTechPref = this.isValidTechPreference(data.task_tech_preference, 'update');
                if (validTechPref.valid == false) {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        validTechPref.code,
                        validTechPref.errorCode,
                        validTechPref.message, {},
                        bellErrUtil.buildCausedBy(validTechPref.message)
                    );
                }
            }

            /*if (!(typeof data.u_amalgamated_ids === "string")) {
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    "property-invalid",
                    this.AMALGAMATED_IDS_INVALID, {},
                    bellErrUtil.buildCausedBy(this.AMALGAMATED_IDS_INVALID)
                );
            }*/

            if (gs.nil(data.state)) result_wot = wot.update();
            else result_wot = wot.sys_id;

            if (!gs.nil(result_wot)) {
                response = this.getJsonData(wot.sys_id, 'wm_task');
                // cette condition est à revoir 
                if (data.hasOwnProperty("skills")) {
                    if (Array.isArray(data.skills) && data.skills.length === 0) {
                        // Reset: remove all skills
                        this.removeTaskSkills(wot.sys_id, null, null);
                    } else if (data.skills) {
                        this.updateSkills(wot.sys_id, data.skills);
                    }
                }
                if (data.template && !data.skills) {
                    this.removeTaskSkills(wot.sys_id, null, taskSkill);
                }
                if (data.hasOwnProperty("external_ids") && !gs.nil(this.getRefData_ExternalId(data.external_ids))) {
                    this.deleteCustomRecord("u_task_id=" + result_wot, this.EXTERNAL_IDs_Table);
                    var externalIdRefData = this.getRefData_ExternalId(data.external_ids, result_wot);

                    if (!gs.nil(externalIdRefData)) {
                        for (var j in externalIdRefData) {

                            this.insertRecord(externalIdRefData[j], "u_task_m2m_external_id");
                        }
                    }

                }
                if (data.hasOwnProperty("related_contacts")) {
                    this.deleteRelatedContacts(wot.sys_id);
                    if (!gs.nil(data.related_contacts)) {
                        this.insertRelatedContacts(data.related_contacts, wot.sys_id);
                    }
                }
                if (data.task_tech_preference) {
                    return this.updateTechPreference(data.task_tech_preference, wot.sys_id);
                }
                // add work note 

                if (data.worknotes) {
                    new global.WOMUtils2().valid_worknote(data.worknotes, result_wot);
                }
                return this.generateResponseWithCode(200, true, this.WOT_UPDATE_SUCCESS, response);
            } else {
                return bellErrUtil.generateBellInternalErrorResponse(
                    500,
                    "validation-error",
                    this.SOMETHING_WENT_WRONG, {},
                    bellErrUtil.buildCausedBy(this.SOMETHING_WENT_WRONG)
                );
            }



        } else {
            return bellErrUtil.generateBellInternalErrorResponse(
                404,
                "property-invalid",
                this.WOT_ID_NOT_FOUND, {},
                bellErrUtil.buildCausedBy(this.WOT_ID_NOT_FOUND)
            );
        }
    },
    //Close Complete 3 -> Complete 6
    // Close Incomplete 4 - > Complete 6
    // Work in progress 18 - > Work in progress 1
    // Accepted 17 - > On route 8

    changeWotState: function(wot, state, substate) {

        /******NOVA  1578 */
        var validtransition = this.transitionStateValid(wot.state, state);
        if (validtransition.code == true) {
            gs.info("object state " + JSON.stringify(validtransition.state_object));
            if (validtransition.state_object.mandatory_field)
                for (var i in validtransition.state_object.mandatory_field) {
                    var mandatory_field = validtransition.state_object.mandatory_field[i];
                    if (gs.nil(wot.getValue(mandatory_field))) {
                        gs.info("mandatory_field empty for State Transition " + mandatory_field);
                        return {
                            success: false,
                            message: mandatory_field + " field is empty",
                            errorCode: "validation-error"
                        };
                    }

                }
            // remove field
            if (validtransition.state_object.remove_field_value)
                for (var i in validtransition.state_object.remove_field_value) {
                    var remove_field = validtransition.state_object.remove_field_value[i];
                    wot.setValue(remove_field, "");

                }

            if (!gs.nil(validtransition.state_object.work_note)) wot.work_notes = validtransition.state_object.work_note;
            wot.state = state;
            if (!gs.nil(this.STATE_FLOW[state])) {
                new global.StateFlow().processFlow(wot, this.STATE_FLOW[state], 'manual');
            }

            var update_wot_return = wot.update();

            gs.info("update_wot_return " + update_wot_return);
            return {
                success: !gs.nil(update_wot_return),
                message: gs.nil(update_wot_return) ? "Something went wrong in State" : "update state done",
                errorCode: gs.nil(update_wot_return) ? "validation-error" : "done"
            };
        } else {
            return {
                success: false,
                message: validtransition.message,
                errorCode: "validation-error"
            };
        }


    },
    getReferenceData: function(table, query, tab) {
        var referenceTab = [];
        if (gs.nil(table) || gs.nil(query)) return -1;
        var grRef = new GlideRecord(table);
        grRef.addEncodedQuery(query);
        grRef.query();
        if (!gs.nil(tab) && tab.length > 0) {
            if (grRef.getRowCount() == tab.length) {
                while (grRef.next()) {
                    referenceTab.push(grRef.sys_id.toString());
                }
                return referenceTab;
            } else return -1;
        }
        if (grRef.next()) return grRef.sys_id;
        return -1;
    },
    verifyStateChanged: function(wotSysid, state, substate) {
        gs.info(wotSysid + 'WOMIntegrationState');
        var wot = new GlideRecord('wm_task');
        if (!gs.nil(state))
            wot.addQuery("state", state);
        if (!gs.nil(substate))
            wot.addQuery("substate", substate);
        wot.addQuery("sys_id", wotSysid);
        wot.query();

        return wot.hasNext();
    },

    verifyTemplateWOT: function(templateId) { // à voir
        var grCWPM = new GlideRecord('cmdb_worktask_product_model');
        grCWPM.addEncodedQuery("sys_id=" + templateId);
        grCWPM.query();
        if (grCWPM.hasNext()) return true;
        else return false;
    },
    verifyCatalog: function(catalogId) {
        var grCat = new GlideRecord('sc_cat_item');
        if (grCat.get(catalogId)) {
            return true;
        } else {
            return false;
        }
    },
    verifyConfigRule: function(config_rule) {

        var grSABCR = new GlideRecord('sn_apptmnt_booking_config_rule');
        grSABCR.addEncodedQuery("sys_id=" + config_rule + "^active=true");
        grSABCR.query();
        if (grSABCR.next()) {
            return true;
        } else return false;
    },

    verifyWO: function(workOrder_sys_id) {
        var grWmOrder = new GlideRecord('wm_order');
        if (grWmOrder.get(workOrder_sys_id)) {
            return true;
        } else false;
    },

    verifyLocation: function(location) {
        var grCL = new GlideRecord('cmn_location');
        if (grCL.get(location)) {
            return true;
        } else return false;
    },
    verifyOpenFor: function(userid) {
        var grCC = new GlideRecord('customer_contact');
        grCC.addEncodedQuery("sys_id=" + userid + "^active=true");
        grCC.query();
        if (grCC.next()) {
            return true;
        } else false;

    },

    verifyFsmContact: function(fsmContactId) {
        var grContact = new GlideRecord(this.FSM_CONTACT_TABLE);
        if (grContact.get(fsmContactId)) {
            return true;
        } else return false;
    },

    validateRelatedContacts: function(relatedContacts) {
        if (!Array.isArray(relatedContacts)) return false;
        for (var i = 0; i < relatedContacts.length; i++) {
            var contact = relatedContacts[i];
            if (gs.nil(contact) || gs.nil(contact.fsm_contact_id) || !this.verifyFsmContact(contact.fsm_contact_id))
                return false;
        }
        return true;
    },

    insertRelatedContacts: function(relatedContacts, wotId) {
        if (!Array.isArray(relatedContacts)) return;
        for (var i = 0; i < relatedContacts.length; i++) {
            this.insertRecord({
                wot_id: wotId,
                fsm_contact_id: relatedContacts[i].fsm_contact_id,
                role_name: relatedContacts[i].role_name
            }, this.RELATED_CONTACTS_TABLE);
        }
    },

    deleteRelatedContacts: function(wotId) {
        var grRelatedContacts = new GlideRecord(this.RELATED_CONTACTS_TABLE);
        grRelatedContacts.addQuery("wot_id", wotId);
        grRelatedContacts.query();
        grRelatedContacts.deleteMultiple();
    },

    generateResponse: function(success, message, data) {
        var result = {};
        result.success = success;
        result.message = message;
        result.data = data ? data : {};
        return result;
    },
    generateResponseWithCode: function(code, success, message, data, error_code) {
        var response = {};
        var result = {};
        response.code = code;
        result.success = success;
        if (success == true) {
            result.message = message;
            result.workOrderTask = data ? data : {};
        } else {
            result.errorCode = error_code ? error_code : "Error code not define";
            result.message = message;

        }

        response.result = result;
        return response;
    },
    generateResponseWithCode_CreateWOT: function(code, success, message, data, error_code) {
        //result = {}
        var response = {};
        var result = {};
        response.code = code;
        result.success = success;
        if (success == true) {
            result.message = message;
            result.workOrderTask = data ? data : {};
        } else {
            result.errorCode = error_code ? error_code : "Error code not define";
            result.message = message;

        }

        response.result = result;
        return response;
    },
    getJsonData: function(sys_idRecord, tableRecord) {
        var grRecord = new GlideRecord(tableRecord);
        var fields = {};
        if (grRecord.get(sys_idRecord)) {
            for (var field in grRecord) {
                if (this.LIST_BOOLEAN_FIELD.indexOf(field) != -1)
                    fields[field] = grRecord.getValue(field) == 1 ? true : false;
                else fields[field] = grRecord.getValue(field);

            }
            if (tableRecord == 'wm_task') {
                fields.related_contacts = this.getRelatedContactsSysIds(sys_idRecord);
            }

        }
        return fields;
    },
    getRelatedContactsSysIds: function(wotId) {
        var relatedContacts = [];
        var grRelatedContacts = new GlideRecord('x_bellc_fsm_task_m2m_relatedcontact');
        grRelatedContacts.addQuery('work_task_reference', wotId);
        grRelatedContacts.query();
        while (grRelatedContacts.next()) {
            relatedContacts.push({
                sys_id: grRelatedContacts.getValue('sys_id')
            });
        }
        return relatedContacts;
    },
    findSkill: function(name) {
        var grCmnSkill = new GlideRecord('cmn_skill');
        grCmnSkill.addEncodedQuery("name=" + name.trim());
        grCmnSkill.setLimit(1);
        grCmnSkill.query();
        if (grCmnSkill.next()) {
            return grCmnSkill.sys_id;
        } else return "-1"; // or retrun null ;
    },
    // findSkillwithLeve allow to know if the skill have level type or not
    findSkillwithLeve: function(name) {

        if (gs.nil(name.trim())) return false;
        var grCmnSkill = new GlideRecord('cmn_skill');
        grCmnSkill.addEncodedQuery("name=" + name.trim() + "^level_typeISNOTEMPTY");
        grCmnSkill.setLimit(1);
        grCmnSkill.query();
        if (grCmnSkill.next()) {
            return true;
        } else return false;
    },

    getLevel: function(level, skill) {
        var level_type;
        var skillRec = new GlideRecord('cmn_skill');
        skillRec.addQuery('name', skill);
        skillRec.query();
        if (skillRec.next()) {
            level_type = skillRec.level_type;
        }
        var grCSL = new GlideRecord('cmn_skill_level');
        grCSL.addEncodedQuery("skill_level_type=" + level_type + "^value=" + level);
        grCSL.setLimit(1);
        grCSL.query();
        if (grCSL.next()) {
            return grCSL.sys_id;
        } else return "-1";
    },

    createTaskSkills: function(skillArray, wot_sysid) {

        //Delete existing task skills in specific task in case there's a template-skill relationship in table "servicetask_model_skill "-added for NOVA-1110
        var removeTaskSkill = new GlideRecord('task_m2m_skill');
        removeTaskSkill.addQuery('task', wot_sysid);
        removeTaskSkill.query();
        while (removeTaskSkill.next()) {
            removeTaskSkill.deleteRecord();
        }

        var skill_task_insert = [];
        //for (var skill in skillArray)
        for (var i = 0; i < skillArray.length; i++) {
            var grTM2S = new GlideRecord('task_m2m_skill');
            var skill_id = this.findSkill(skillArray[i].skill_name);
            var level = this.getLevel(skillArray[i].skill_level, skillArray[i].skill_name);
            // if (skill_id != "-1" && wot_sysid && level != "-1") {
            if (skill_id != "-1" && wot_sysid) {
                grTM2S.initialize();
                grTM2S.task = wot_sysid;
                grTM2S.skill = skill_id;
                grTM2S.skill_level = level;
                grTM2S.mandatory = true;
                var skill_task = grTM2S.insert();
                skill_task_insert.push(skill_task);
            }

        }
        if (skill_task_insert) {
            var grTM2S_supp = new GlideRecord('task_m2m_skill');
            grTM2S_supp.addEncodedQuery("sys_idNOT IN" + skill_task_insert + "^task=" + wot_sysid);
            grTM2S_supp.setLimit(1);
            grTM2S_supp.query();
            while (grTM2S_supp.next()) {
                grTM2S_supp.deleteRecord();
            }
        }
    },

    getIDs: function(skillArray) {
        var ids = [];
        for (var i = 0; i < skillArray.length; i++) {
            var grTM2S = new GlideRecord('cmn_skill');
            grTM2S.addQuery('name', skillArray[i].skill_name);
            gs.print(skillArray[i].skill_name);
            grTM2S.query();
            if (grTM2S.next()) {
                ids.push(grTM2S.getUniqueValue());
            }
        }
        return ids;
    },


    removeTaskSkills: function(wot, skillArray, sysIdSkills) {
        var grTM2S = new GlideRecord('task_m2m_skill');
        grTM2S.addQuery('task', wot);
        if (!gs.nil(skillArray))
            grTM2S.addEncodedQuery("skillNOT IN" + this.getIDs(skillArray));
        if (!gs.nil(sysIdSkills)) {
            grTM2S.addEncodedQuery("skillNOT IN" + sysIdSkills);
        }
        grTM2S.query();
        while (grTM2S.next()) {
            grTM2S.deleteRecord();
        }

    },

    isValidPriority: function(priority) {
        var value = parseInt(priority, 10);
        return !isNaN(value) && value >= 1 && value <= 5;
    },
    /*
     * @param {number} state - state value
     * @param {string} action - (create or update) this value define 
     * @returns {boolean} Service definition object or null if not found
     */
    isValidState: function(state, action) {

        var validStatesForCreate = [1, 10, 4];
        var validStatesForUpdate = [1, 3, 4, 7, 12, 22, 10, 17, 18];
        var value = parseInt(state, 10);

        if (action == "create")
            return validStatesForCreate.indexOf(value) !== -1;
        else if (action == "update")
            return validStatesForUpdate.indexOf(value) !== -1;
        else return false;

    },
    getSubstate: function(state) {
        var value = parseInt(state, 10);
        if (value == 17) return 8;
        if (value == 18) return 1;
        if (value == 3 || value == 4) return 6;
        return null;
    },
    isValidDate: function(date) {
        if (gs.nil(new GlideDateTime(date).getValue()))
            return false;
        else return true;
    },


    updateSkills: function(wot, skillArray) {
        var skill_task_insert = [];

        this.removeTaskSkills(wot, null, null);

        for (var j = 0; j < skillArray.length; j++) {
            var skill_id = this.findSkill(skillArray[j].skill_name);
            var level = this.getLevel(skillArray[j].skill_level, skillArray[j].skill_name);
            var grTM2S = new GlideRecord('task_m2m_skill');
            grTM2S.initialize();
            grTM2S.task = wot;
            grTM2S.skill = skill_id;
            grTM2S.skill_level = level;
            grTM2S.mandatory = true;
            var skill_task = grTM2S.insert();
            skill_task_insert.push(skill_task);
        }

        if (skill_task_insert) {
            var grTM2S_supp = new GlideRecord('task_m2m_skill');
            grTM2S_supp.addEncodedQuery("sys_idNOT IN" + skill_task_insert + "^task=" + wot);
            grTM2S_supp.setLimit(1);
            grTM2S_supp.query();
            while (grTM2S_supp.next()) {
                grTM2S_supp.deleteRecord();
            }
        }

    },

    findStateFlow: function(currentState, newState) {
        var stateFlow = new GlideRecord('sf_work_task');
        if (newState == 7) {
            stateFlow.addQuery('ending_state.value=' + parseInt(newState));
        } else {
            stateFlow.addQuery('starting_state.value=' + parseInt(currentState) + '^ending_state.value=' + parseInt(newState));
        }
        stateFlow.query();
        if (stateFlow.next()) {
            return stateFlow.sys_id;
        } else {
            return null;
        }
    },

    getTaskSkills: function(wot) {
        var taskSkills = [];
        var grSkills = new GlideRecord('task_m2m_skill');
        grSkills.addQuery('task', wot);
        grSkills.query();
        while (grSkills.next()) {
            taskSkills.push(grSkills.skill.toString());
        }
        return taskSkills;
    },

    isValidSkill: function(skillArray) {
        var skillsPb = {
            valid: true,
            message: "",
            errorCode: "",
            code: 400
        };
        if (gs.nil(skillArray)) {
            skillsPb.valid = false;
            skillsPb.message = "Skills Empty ";
            skillsPb.errorCode = "property-missing";
            return skillsPb;
        }
        if (!Array.isArray(skillArray)) {
            skillsPb.valid = false;
            skillsPb.message = "Skills bad format ";
            skillsPb.errorCode = "validation-error";
            return skillsPb;
        }
        if (Array.isArray(skillArray) && skillArray.length == 0) {
            skillsPb.valid = false;
            skillsPb.message = "Skills array is empty ";
            skillsPb.errorCode = "validation-error";
            return skillsPb;
        }

        if (Array.isArray(skillArray)) {

            for (var i = 0; i < skillArray.length; i++) {
                var skill = skillArray[i];

                if (skill == null) {
                    skillsPb.valid = false;
                    skillsPb.message = "one of skills is empty or null";
                    skillsPb.errorCode = "property-missing";
                    return skillsPb;
                }
                if (!skill.skill_name) {
                    skillsPb.valid = false;
                    skillsPb.message = "Skill name missing";
                    skillsPb.errorCode = "property-missing";
                    return skillsPb;
                }
                if (!skill.is_mandatory) {
                    skillsPb.valid = false;
                    skillsPb.message = "Skill 'is mandatory' property missing";
                    skillsPb.errorCode = "property-missing";
                    return skillsPb;
                }

                var skill_id = this.findSkill(skill.skill_name);


                if (skill_id == "-1") {
                    skillsPb.valid = false;
                    skillsPb.message = "Skill name not found "; // + skill.skill_name;
                    skillsPb.errorCode = "property-invalid";
                    skillsPb.code = 404;
                    return skillsPb;

                }
                if (this.findSkillwithLeve(skill.skill_name) == true) {
                    if (!gs.nil(skill.skill_level)) {
                        var level = this.getLevel(skill.skill_level, skill.skill_name);
                        if (level == "-1") {
                            skillsPb.valid = false;
                            skillsPb.message = "Skill level not found "; // + skill.skill_level;
                            skillsPb.errorCode = "property-invalid";
                            skillsPb.code = 404;
                            return skillsPb;
                        }

                    }
                    /* else {
                                            skillsPb.valid = false;
                                            skillsPb.message = "Skill level missing";
                                            skillsPb.errorCode = "property-missing";
                                            return skillsPb;
                                        }*/
                }




            }
            return skillsPb;
        }
    },
    validStateSubstate: function(state, substate) {
        const ALLOWED = new Set([
            "17:8", // Accepted -> On Route
            "17:10", // Accepted -> Onsite Arrival
            "18:1", // WIP -> Work In Progress
            "18:3", // WIP -> Paused
            "18:6", // WIP -> Complete
            "18:8", // WIP -> On Route
            "18:10", // WIP -> Onsite Arrival
            "18:20", // WIP -> Auto Unassigned
            "3:6", // Ckise Complete -> Complete
            "4:6", //Close Incomplete -> Complete
        ]);

        return ALLOWED.has(state + ":" + substate);
    },
    validSubstate: function(substate) {
        var tabSubState = ["8", "10", "6"];
        return tabSubState.indexOf(substate) !== -1;
    },

    enginePayloadValidation: function(data, action) {

    },
    getReasonCode: function(reaconCode) {
        var grXBFCR = new GlideRecord('x_bellc_fsm_code_reason');
        grXBFCR.addEncodedQuery("name=" + reaconCode.trim() + "^ORsys_id=" + reaconCode.trim());
        grXBFCR.setLimit(1);
        grXBFCR.query();
        if (grXBFCR.next()) {
            return grXBFCR.sys_id;
        }
        return null;
    },
    isValidDateTime: function(dateTimeString) {
        // Format attendu : YYYY-MM-DD HH:mm:ss
        var regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
        if (!regex.test(dateTimeString.trim())) {
            return false;
        }

        // Vérifie que la date existe vraiment
        try {
            var gdt = new GlideDateTime(dateTimeString.trim());
            return !gs.nil(gdt.getValue());
        } catch (e) {
            return false;
        }
    },
    isValidDuration: function(dateTimeString) {

        // Format attendu : Number HH:mm:ss
        var regex = /^\d+\s+\d{2}:\d{2}:\d{2}$/;
        if (!regex.test(dateTimeString.trim())) {
            return false;
        } else return true;
    },
    isValidTime: function(timeString) {

        // Format attendu : Number HH:mm:ss
        var regex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
        if (!regex.test(timeString.trim())) {
            return false;
        } else return true;
    },
    locationWithTerritory: function(wmTask, location) {
        var retour = {
            success: false,
            territory: ""
        };
        wmTask.location = location;
        var fieldServiceTerritoryAPI = new sn_fsm_tp.FieldServiceTerritoryPlanning();
        var matchedTerritories = fieldServiceTerritoryAPI.getMatchedTerritories(wmTask);
        if (gs.nil(matchedTerritories)) retour.success = false;
        else retour.success = true;
        retour.territory = matchedTerritories;
        return retour;

    },
    checkAssignGroupforTerritory: function(territory) {

        if (territory.success == false) return false;
        var grSTTG = new GlideRecord('sn_tp_territory_group');
        grSTTG.addEncodedQuery("group.typeLIKE59e22fb137032000158bbfc8bcbe5d52^territoryIN" + territory.territory);
        grSTTG.setLimit(1);
        grSTTG.query();
        return grSTTG.hasNext();
    },
    getDisplayValueState: function(state) {
        var grSysChoice = new GlideRecord('sys_choice');
        grSysChoice.addEncodedQuery("element=state^name=wm_task^language=en^value=" + state);
        grSysChoice.setLimit(1);
        grSysChoice.query();
        if (grSysChoice.next()) {
            return grSysChoice.label;
        } else return null;
    },
    getStateFMO: function(state, substate) {
        if (state.toString() == "10") return "Open";
        if (state.toString() == "12") return "Scheduled";
        if (state.toString() == "22") return "Assigned";
        if (state.toString() == "17" || (state.toString() == "17" && substate.toString() == "8")) return "En Route";
        if (state.toString() == "18" || (state.toString() == "18" && substate.toString() == "10")) return "On Site";
        if (state.toString() == "3" || (state.toString() == "3" && substate.toString() == "6")) return "Complete";
        if (state.toString() == "7") return "Cancelled";
        if (state.toString() == "4" || (state.toString() == "4" && substate.toString() == "6")) return "Incomplete";
        if (state.toString() == "1") return "Manual Handling";
    },
    transitionStateValid: function(prevState, newState) {
        prevState = Number(prevState);
        newState = Number(newState);

        var legalAPIstate = [1, 10, 17, 12, 22, 18, 3, 4, 7];
        if (legalAPIstate.indexOf(newState) == -1 || legalAPIstate.indexOf(prevState) == -1) {
            gs.info("WOM :State not  found prevState " + prevState + " , new State " + newState)
            return {
                code: false,
                state_object: null,
                message: "State Not Found"
            };
        }

        var allowedTransitions = {
            //Manual Handling
            1: {
                //manual handling 
                1: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description"],
                    "work_note": ""
                },
                //open
                10: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description"],
                    "work_note": ""
                },
                // schedule
                12: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description"],
                    "work_note": ""
                },
                //assigned
                22: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description", "assigned_to", "assignment_group"],
                    "work_note": ""
                },
                // complete
                3: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description"],
                    "work_note": "Work order task Closed by API WOM FSM"
                },
                // cancel
                7: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description"],
                    "work_note": "Work order task cancelled by API WOM FSM"
                }
            },
            //OPEN
            10: {
                //manual handling 
                1: {
                    "state_flow": "sys_id",
                    "remove_field_value": ["assigned_to", "assignment_group"],
                    "mandatory_field": ["location", "territory", "short_description"],
                    "work_note": " state transition " + this.getStateFMO(prevState) + " to " + this.getStateFMO(newState)
                },
                //scheduled
                12: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description", "location", "assignment_group", "assigned_to", "expected_start"],
                    "work_note": ""
                },
                //assigned
                22: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description", "location", "assignment_group", "assigned_to", "expected_start"],
                    "work_note": ""
                },
                // complete
                3: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start"],
                    "work_note": "Work order task Closed by API WOM FSM"
                },
                // cancel
                7: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description"],
                    "work_note": "Work order task cancelled by API WOM FSM"
                },
                // Incomplete
                4: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start"],
                    "work_note": "Work order task incompleted  by API WOM FSM"
                }
            },
            // SCHEDULE 
            12: {
                //manual handling 
                1: {
                    "state_flow": "sys_id",
                    "remove_field_value": ["assigned_to", "assignment_group"],
                    "mandatory_field": ["location", "territory", "short_description"],
                    "work_note": " state transition " + this.getStateFMO(prevState) + " to " + this.getStateFMO(newState)
                },
                // open
                10: {
                    "state_flow": "sys_id",
                    "remove_field_value": ["assigned_to", "assignment_group"],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start"],
                    "work_note": " state transition " + this.getStateFMO(prevState) + " to " + this.getStateFMO(newState)
                },
                // assigned
                22: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start", "assignment_group", "assigned_to"],
                    "work_note": ""
                },
                //cancel
                7: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start", "assignment_group", "assigned_to"],
                    "work_note": "Work order task cancelled by API WOM FSM"
                }

            },
            // Assigned 
            22: {
                //manual handling 
                1: {
                    "state_flow": "sys_id",
                    "remove_field_value": ["assigned_to", "assignment_group"],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start"],
                    "work_note": " state transition " + this.getStateFMO(prevState) + " to " + this.getStateFMO(newState)
                },
                //open
                10: {
                    "state_flow": "sys_id",
                    "remove_field_value": ["assigned_to", "assignment_group"],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start"],
                    "work_note": " state transition " + this.getStateFMO(prevState) + " to " + this.getStateFMO(newState)
                },
                //en Route
                17: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start", "assignment_group", "assigned_to"],
                    "work_note": ""
                },
                // complete
                3: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start", "assignment_group", "assigned_to"],
                    "work_note": "Work order task Closed by API WOM FSM"
                },
                // Incomplete
                4: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start", "assignment_group", "assigned_to"],
                    "work_note": "Work order task incompleted  by API WOM FSM"
                },
                // cancel
                7: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start", "assignment_group", "assigned_to"],
                    "work_note": "Work order task cancelled by API WOM FSM"
                },
            },
            // En route
            17: {
                //manual handling 
                1: {
                    "state_flow": "sys_id",
                    "remove_field_value": ["assigned_to", "assignment_group"],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start", "actual_travel_start"],
                    "work_note": " state transition " + this.getStateFMO(prevState) + " to " + this.getStateFMO(newState)
                },
                //open
                10: {
                    "state_flow": "sys_id",
                    "remove_field_value": ["assigned_to", "assignment_group"],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start", "actual_travel_start"],
                    "work_note": " state transition " + this.getStateFMO(prevState) + " to " + this.getStateFMO(newState)
                },
                // assigned
                22: {
                    "state_flow": "sys_id",
                    "remove_field_value": ["actual_travel_start"],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start", "assignment_group", "assigned_to", "actual_travel_start"],
                    "work_note": ""
                },
                // Onstite
                18: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start", "assignment_group", "assigned_to", "actual_travel_start"],
                    "work_note": ""
                },
                // Incomplete
                4: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start", "assignment_group", "assigned_to", "actual_travel_start"],
                    "work_note": "Work order task incompleted  by API WOM FSM"
                }

            },
            // On site
            18: {
                //manual handling 
                1: {
                    "state_flow": "sys_id",
                    "remove_field_value": ["assigned_to", "assignment_group"],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start", "work_start"],
                    "work_note": " state transition " + this.getStateFMO(prevState) + " to " + this.getStateFMO(newState)
                },
                //open
                10: {
                    "state_flow": "sys_id",
                    "remove_field_value": ["assigned_to", "assignment_group"],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start"],
                    "work_note": " state transition " + this.getStateFMO(prevState) + " to " + this.getStateFMO(newState)
                },
                // assigned
                22: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start", "assignment_group", "assigned_to", "work_start"],
                    "work_note": ""
                },
                // complete
                3: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start", "assignment_group", "assigned_to", "work_start"],
                    "work_note": "Work order task completed  by API WOM FSM"
                },
                // Incomplete
                4: {
                    "state_flow": "sys_id",
                    "remove_field_value": [],
                    "mandatory_field": ["location", "territory", "short_description", "expected_start", "assignment_group", "assigned_to", "work_start"],
                    "work_note": "Work order task incompleted  by API WOM FSM"
                }

            }

        };
        if (gs.nil(allowedTransitions[prevState])) {
            return {
                code: false,
                state_object: null,
                message: "illegal state transition " + this.getStateFMO(prevState) + " to " + this.getStateFMO(newState)
            };
        }
        var isValidTransition = !gs.nil(allowedTransitions[prevState][newState]);
        return {
            code: isValidTransition,
            state_object: isValidTransition ? allowedTransitions[prevState][newState] : null,
            message: isValidTransition ? "transition allowed" : "illegal state transition " + this.getStateFMO(prevState) + " to " + this.getStateFMO(newState)
        };


    },
    checkDate: function(wot) {
        var bellErrUtil = new FSMBellInternalErrorUtil();

        var windowEnd = wot.window_end;
        var windowStart = wot.window_start;
        var scheduleStart = wot.expected_start ? wot.expected_start : null;

        windowEnd = windowEnd ? windowEnd : null;
        windowStart = windowStart ? windowStart : null;


        if (windowEnd != null && windowStart != null) {
            var win_end = new GlideDateTime(windowEnd);
            var win_start = new GlideDateTime(windowStart);
            if (win_end < win_start) {
                //  return this.generateResponseWithCode(400, false, this.WOT_WINDOW_END_AFTER_WINDOW_START, '', 'validation-error');
                return {
                    "success": false,
                    "response": bellErrUtil.generateBellInternalErrorResponse(
                        400,
                        "validation-error",
                        this.WOT_WINDOW_END_AFTER_WINDOW_START, {},
                        bellErrUtil.buildCausedBy(this.WOT_WINDOW_END_AFTER_WINDOW_START)
                    )
                };

            }
        }
        if (scheduleStart != null) {
            var schedule_start = new GlideDateTime(scheduleStart);
            var win_start = new GlideDateTime(windowStart);
            if (win_start > schedule_start)
                //return this.generateResponseWithCode(400, false, gs.getMessage("Window start should be before Scheduled start"), '', 'validation-error');
                return {
                    "success": false,
                    "response": bellErrUtil.generateBellInternalErrorResponse(
                        400,
                        "validation-error",
                        gs.getMessage("Window start should be before Scheduled start"), {},
                        bellErrUtil.buildCausedBy(gs.getMessage("Window start should be before Scheduled start"))
                    )
                };

        }
        //



        if (wot.is_fixed_window && !gs.nil(wot.estimated_end) && !gs.nil(wot.expected_start) && !gs.nil(wot.window_start) && !gs.nil(wot.window_end)) {
            var plannedWorkStart = wot.expected_start.getGlideObject().getNumericValue();
            var plannedWorkEnd = wot.estimated_end.getGlideObject().getNumericValue();
            var windowStart = wot.window_start.getGlideObject().getNumericValue();
            var windowEnd = wot.window_end.getGlideObject().getNumericValue();
            if (plannedWorkStart < windowStart || plannedWorkStart > windowEnd || plannedWorkEnd < windowStart || plannedWorkEnd > windowEnd) {
                if (!gs.nil(wot.actual_travel_start) && this.WOT_INITIAL.getValue("actual_travel_start") != wot.getValue("actual_travel_start")) //return this.generateResponseWithCode(400, false, gs.getMessage("Task needs to start and complete within the window when it is fixed."), '', 'validation-error');
                {
                    return {
                        "success": false,
                        "response": bellErrUtil.generateBellInternalErrorResponse(
                            400,
                            "validation-error",
                            gs.getMessage("Task needs to start and complete within the window when it is fixed."), {},
                            bellErrUtil.buildCausedBy(gs.getMessage("Task needs to start and complete within the window when it is fixed."))
                        )
                    };
                } else {
                    if (plannedWorkEnd > windowEnd) {
                        return {
                            "success": false,
                            "response": bellErrUtil.generateBellInternalErrorResponse(
                                400,
                                "validation-error",
                                gs.getMessage("{0} is now expected to complete after window end", wot.getValue("number")), {},
                                bellErrUtil.buildCausedBy(gs.getMessage("{0} is now expected to complete after window end", wot.getValue("number")))
                            )
                        };
                        //gs.addInfoMessage(gs.getMessage("{0} is now expected to complete after window end", wot.getValue("number")))
                    }
                }
            }
        }


        return {
            "success": true,
            "response": "good"
        }
    },

    getAssignmentGroup: function(task) {
        var filter = this.filterAssignmentGroups(task);
        var group = new GlideRecord('sys_user_group');
        group.addEncodedQuery(filter.toString());
        group.setLimit(1);
        group.query();
        if (group.next()) {
            return group.sys_id;
        } else return null;
    },

    checkUserMembership: function(userId, groupId) {
        var gr = new GlideRecord('sys_user_grmember');
        gr.addQuery('user', userId);
        gr.addQuery('group', groupId);
        gr.query();
        if (!gr.next()) {
            return false;
        } else return true;
    },

    addAssignedTo: function(taskId, assignedTo, assignmentGroup, expectedStart, wot) {
        var wmTask = new GlideRecord('wm_task');
        var assGroup;
        if (wmTask.get(taskId)) {
            if (!gs.nil(wmTask.territory)) {
                if (gs.nil(assignmentGroup)) {
                    assGroup = this.getAssignmentGroup(wmTask);
                    if (!gs.nil(assGroup)) {
                        wot.setValue('assignment_group', assGroup);
                        if (this.checkUserMembership(assignedTo, assGroup)) {
                            wot.setValue('assigned_to', assignedTo);
                        }
                    }
                } else {
                    if (this.checkUserMembership(assignedTo, assignmentGroup)) {
                        wot.setValue('assigned_to', assignedTo);
                    }
                }
            }
            if (gs.nil(expectedStart)) {
                if (gs.nil(wmTask.expected_start)) {
                    wot.setValue('expected_start', '');
                    new global.WOMUtils2().setWorkflow(wot);
                }
            } else {
                wot.setValue('expected_start', expectedStart);
            }
        }
    },

    verifyAssignedTo: function(userId) {
        var user = new GlideRecord('sys_user');
        if (user.get(userId)) {
            return true;
        } else return false;
    },

    deleteWot: function(sysId) {
        new global.WOMUtils2().deleteWot(sysId);
    },
    getRefData_ExternalId: function(tab, task_id) {

        var outputTab = [];
        if (!Array.isArray(tab) || gs.nil(tab) || tab.length < 1) return null;
        for (var i in tab) {
            //if (this.EXTERNAL_IDs_LIST_ROLE.indexOf(tab[i].u_external_id_role) == -1) return null;
            var ref_Data = this.verifyRecord(this.CONSUMED_DIC, "active=true^target_field=u_external_id_role^code=" + tab[i].u_external_id_role);
            if (ref_Data != -1) {
                if (!task_id) task_id = "sys_id"
                outputTab[i] = {
                    "u_external_id_value": ref_Data.toString(),
                    "u_task_id": task_id.toString(),
                    "u_external_id_owner": tab[i].u_external_id_owner,
                    "u_external_id_role": tab[i].u_external_id_role

                };

                // if (task_id)
                //     tab[i].u_task_id = task_id.toString();
            } else return null;
        }

        return outputTab;
    },

    verifyRecord: function(table, query) {
        var grRecord = new GlideRecord(table);
        grRecord.addEncodedQuery(query);
        grRecord.query();
        if (grRecord.next()) return grRecord.sys_id;
        else return -1;
    },
    insertRecord: function(arrayMap, table) {
        var grRecord = new GlideRecord(table);
        grRecord.initialize();

        for (var key in arrayMap) {

            if (arrayMap[key]) {
                grRecord.setValue(key, arrayMap[key]);
            }
        }

        return grRecord.insert();

    },
    deleteCustomRecord: function(query, table) {
        var allowTab = ["u_task_m2m_external_id"];
        if (allowTab.indexOf(table) == -1 || gs.nil(query)) return null;
        var grRef = new GlideRecord(table);
        grRef.addEncodedQuery(query);
        grRef.query();
        grRef.deleteMultiple();
    },

    filterAssignmentGroups: function(task) {
        var assignmentGroups = [];

        if (new global.WMFilters().isTerritoryPlanningActive()) {
            var fieldServiceTerritoryAPI = new sn_fsm_tp.FieldServiceTerritoryPlanning();
            var territory = task.territory.toString();
            var assigned_to = (!(new String(task.assigned_to) + "" == "''")) ? task.assigned_to.toString() : ''; // when unassign from DW event-body this should be empty
            if (territory) {
                if (assigned_to) {
                    if (task.scheduling_method == "dynamic_schedule" && task.assigned_crew != "")
                        assignmentGroups = fieldServiceTerritoryAPI.getTerritoryAssignmentGroupsForUser(territory, assigned_to, true);
                    else
                        assignmentGroups = fieldServiceTerritoryAPI.getTerritoryAssignmentGroupsForUser(territory, assigned_to, false);
                    return 'sys_idIN' + assignmentGroups.join(',');
                } else {
                    assignmentGroups = fieldServiceTerritoryAPI.getValidAssignmentGroupsForTerritory(task);
                }
            }
            return assignmentGroups;
        } else {
            return this.getAssignmentLOV(task);
        }
    },

    createTechPreference: function(techPrefArray, wot) {
        var techPref = new GlideRecord('wm_task_tech_preference');
        techPref.addQuery('task', wot);
        for (i = 0; i < techPrefArray.length; i++) {
            /*techPref.addQuery('assignment_preference', techPrefArray[i].assignment_preference);
            techPref.addQuery('technician', techPrefArray[i].sys_id);
            techPref.query();
            if (!techPref.next()) {*/
            techPref.initialize();
            techPref.setValue('task', wot);
            techPref.setValue('assignment_preference', techPrefArray[i].assignment_preference);
            techPref.setValue('technician', this.findTech(techPrefArray[i].sys_id));
            var inser = techPref.insert();
            if (gs.nil(inser)) {
                this.deleteWot(wot);
                return bellErrUtil.generateBellInternalErrorResponse(
                    500,
                    "unexpected-server-error",
                    this.INTERNAL_ERROR, {},
                    bellErrUtil.buildCausedBy(this.INTERNAL_ERROR)
                );

            }
            /*} else {
                this.deleteWot(wot);
                return bellErrUtil.generateBellInternalErrorResponse(
                    400,
                    'validation-error',
                    'This technician with this id ' + techPrefArray[i].sys_id + ' already exist with this assignment preference ' + techPrefArray[i].assignment_preference, {},
                    bellErrUtil.buildCausedBy('This technician with this id ' + techPrefArray[i].sys_id + ' already exist with this assignment preference ' + techPrefArray[i].assignment_preference)
                );
            }*/
        }
        return 1;

    },

    isValidTechPreference: function(techPrefArray, operation) {
        var techPrefProblem = {
            valid: true,
            message: "",
            errorCode: "",
            code: 400
        };
        if (gs.nil(techPrefArray)) {
            techPrefProblem.valid = false;
            techPrefProblem.message = "Technician preference Empty ";
            techPrefProblem.errorCode = "property-missing";
            return techPrefProblem;
        }
        if (!Array.isArray(techPrefArray)) {
            techPrefProblem.valid = false;
            techPrefProblem.message = "Technician preference bad format ";
            techPrefProblem.errorCode = "validation-error";
            return techPrefProblem;
        }
        if (operation == 'create') {
            if (Array.isArray(techPrefArray) && techPrefArray.length == 0) {
                techPrefProblem.valid = false;
                techPrefProblem.message = "Technician preference array is empty ";
                techPrefProblem.errorCode = "validation-error";
                return techPrefProblem;
            }
        }

        if (Array.isArray(techPrefArray)) {

            for (var i = 0; i < techPrefArray.length; i++) {
                var techPref = techPrefArray[i];

                if (techPref == null) {
                    techPrefProblem.valid = false;
                    techPrefProblem.message = "One of Technician preference is empty or null";
                    techPrefProblem.errorCode = "property-missing";
                    return techPrefProblem;
                }
                if (!techPref.assignment_preference) {
                    techPrefProblem.valid = false;
                    techPrefProblem.message = "Technician assignment Preference missing";
                    techPrefProblem.errorCode = "property-missing";
                    return techPrefProblem;
                }
                if (techPref.assignment_preference != 'excluded_technician' && techPref.assignment_preference != 'preferred_technician' && techPref.assignment_preference != 'secondary_technician') {
                    techPrefProblem.valid = false;
                    techPrefProblem.message = "Technician assignment Preference invalid should be excluded_technician, preferred_technician or secondary_technician";
                    techPrefProblem.errorCode = "property-invalid";
                    return techPrefProblem;
                }

                var techId = this.findTech(techPref.sys_id);


                if (gs.nil(techId)) {
                    techPrefProblem.valid = false;
                    techPrefProblem.message = "Technician not found ";
                    techPrefProblem.errorCode = "property-invalid";
                    techPrefProblem.code = 404;
                    return techPrefProblem;

                }
            }
            return techPrefProblem;
        }
    },

    findTech: function(sysId) {
        var tech = new GlideRecord('sys_user');
        tech.addEncodedQuery('sys_id=' + sysId);
        tech.query();
        if (tech.next()) {
            return tech.sys_id;
        } else {
            return null;
        }
    },

    deleteTechPref: function(wotId) {
        new global.WOMUtils2().deleteTechPref(wotId);
    },

    updateTechPreference: function(techPrefArray, wotId) {
        var bellErrUtil = new FSMBellInternalErrorUtil();
        this.deleteTechPref(wotId);
        if (Array.isArray(techPrefArray) && techPrefArray.length != 0) {
            var techPref = new GlideRecord('wm_task_tech_preference');
            techPref.addQuery('task', wotId);
            for (i = 0; i < techPrefArray.length; i++) {
                techPref.initialize();
                techPref.setValue('task', wotId);
                techPref.setValue('assignment_preference', techPrefArray[i].assignment_preference);
                techPref.setValue('technician', this.findTech(techPrefArray[i].sys_id));
                var inser = techPref.insert();
                if (gs.nil(inser)) {
                    return bellErrUtil.generateBellInternalErrorResponse(
                        500,
                        "unexpected-server-error",
                        this.INTERNAL_ERROR, {},
                        bellErrUtil.buildCausedBy(this.INTERNAL_ERROR)
                    );

                }
            }
        }
        return this.generateResponseWithCode_CreateWOT(200, true, this.WOT_UPDATE_SUCCESS, this.getJsonData(wotId, 'wm_task'));

    },
    type: 'WOMintegrationUtils'
};