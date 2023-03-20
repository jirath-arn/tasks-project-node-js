// Load middleware.
const authMiddleware = require('../middleware/auth');

// Load config.
const responseCode = require('../config/response_code_configuration');
const status = require('../config/status_configuration');

// Load libraries.
const response = require('../libraries/response');
const datetime = require('../libraries/datetime');

// Load dependencies.
const express = require('express');
const router = express.Router();

// Load models.
const taskModel = require('../models/task');

// Read tasks.
/*******************************
 * Method: GET
 * Param: 
 * Return:
 * 0x0000-00000 -> Process Request Complete.
********************************/
router.get('/', authMiddleware, async (req, res) => {
    try
    {
        // Get tasks.
        let filter = {};
        filter.select = "tasks.id AS 'tasks::id', ";
        filter.select += "tasks.title AS 'tasks::title', ";
        filter.select += "tasks.created_at AS 'tasks::created_at', ";
        filter.select += "tasks.updated_at AS 'tasks::updated_at'";
        filter.custom_where = `tasks.user_id = ${req.user.user_id} AND tasks.status = '${status.STATUS_ACTIVATE}'`;
        filter.order_by = 'tasks.created_at ASC';
        const results = await taskModel.search(filter);
        
        return response.success(res, 200, responseCode[200].CODE, responseCode[200].MESSAGE, results);
    }
    catch(err)
    {
        console.log(err);
        return response.error(res, 500, err);
    }
});

// Create task.
/*******************************
 * Method: POST
 * Param: title
 * Return:
 * 0x0000-00000 -> Process Request Complete.
 * 0x8000-00000 -> Please complete the information.
********************************/
router.post('/', authMiddleware, async (req, res) => {
    try
    {
        const title = req.body.title;

        if(!title) return response.success(res, 400, responseCode[400].CODE, responseCode[400].MESSAGE);

        // Datetime now.
        const dt = datetime.now();

        // Create new task.
        const results = await taskModel.create({
            user_id: req.user.user_id,
            title: title,
            status: status.STATUS_ACTIVATE,
            created_at: dt,
            updated_at: dt
        });
        
        return response.success(res, 201, responseCode[200].CODE, responseCode[200].MESSAGE, results);
    }
    catch(err)
    {
        console.log(err);
        return response.error(res, 500, err);
    }
});

// Update task.
/*******************************
 * Method: PUT
 * Param: task_id, title
 * Return:
 * 0x0000-00000 -> Process Request Complete.
 * 0x8000-00000 -> Please complete the information.
********************************/
router.put('/', authMiddleware, async (req, res) => {
    try
    {
        const task_id = req.body.task_id;
        const title = req.body.title;

        if(!(task_id && title)) return response.success(res, 400, responseCode[400].CODE, responseCode[400].MESSAGE);

        // Datetime now.
        const dt = datetime.now();

        // Update task.
        const results = await taskModel.update({
            id: task_id,
            title: title,
            status: status.STATUS_ACTIVATE,
            updated_at: dt
        });
        
        return response.success(res, 200, responseCode[200].CODE, responseCode[200].MESSAGE, results);
    }
    catch(err)
    {
        console.log(err);
        return response.error(res, 500, err);
    }
});

// Delete task.
/*******************************
 * Method: DELETE
 * Param: task_id
 * Return:
 * 0x0000-00000 -> Process Request Complete.
 * 0x8000-00000 -> Please complete the information.
********************************/
router.delete('/', authMiddleware, async (req, res) => {
    try
    {
        const task_id = req.body.task_id;

        if(!task_id) return response.success(res, 400, responseCode[400].CODE, responseCode[400].MESSAGE);

        // Delete task.
        let filter = {};
        filter.custom_where = `tasks.id = ${task_id}`;
        const results = await taskModel.delete(filter);
        
        return response.success(res, 200, responseCode[200].CODE, responseCode[200].MESSAGE, results);
    }
    catch(err)
    {
        console.log(err);
        return response.error(res, 500, err);
    }
});

// Export modules.
module.exports = router;
