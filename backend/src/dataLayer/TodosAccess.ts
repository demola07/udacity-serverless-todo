import * as AWS from 'aws-sdk';
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
//import * as AWSXRay from 'aws-xray-sdk';
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS);

export default class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly indexName = process.env.TODOS_BY_USER_INDEX
    ) { }
    /**
     *
     *
     * @param {*} todoItem
     * @memberof TodosAccess
     */
    async addTodoToDB(todoItem: CreateTodoRequest) {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise();
    }
    /**
     *
     *
     * @param {*} todoId
     * @param {*} userId
     * @memberof TodosAccess
     */
    async deleteTodoFromDB(todoId: string, userId: string) {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise();
    }
    /**
     *
     *
     * @param {*} todoId
     * @param {*} userId
     * @returns
     * @memberof TodosAccess
     */
    async getTodoFromDB(todoId: string, userId: string) {
        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise();

        return result.Item;
    }

    /**
     *
     *
     * @param {*} userId
     * @returns
     * @memberof TodosAccess
     */
    async getAllTodosFromDB(userId: string) {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.indexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        return result.Items;
    }
    /**
     *
     *
     * @param {*} todoId
     * @param {*} userId
     * @param {*} updatedTodo
     * @memberof TodosAccess
     */
    async updateTodoInDB(todoId: string, userId: string, updatedTodo: UpdateTodoRequest) {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set #name = :n, #dueDate = :due, #done = :d',
            ExpressionAttributeValues: {
                ':n': updatedTodo.name,
                ':due': updatedTodo.dueDate,
                ':d': updatedTodo.done
            },
            ExpressionAttributeNames: {
                '#name': 'name',
                '#dueDate': 'dueDate',
                '#done': 'done'
            }
        }).promise();
    }

    /**
     *
     *
     * @param {*} todoId
     * @param {*} userId
     * @param {*} attachmentUrl
     * @memberof TodosAccess
     */
    async updateAttachmentInDB(todoId: string, userId: string, attachmentUrl: string) {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set #attachmentUrl = :a',
            ExpressionAttributeValues: {
                ':a': attachmentUrl
            },
            ExpressionAttributeNames: {
                '#attachmentUrl': 'attachmentUrl'
            }
        }).promise();
    }
}
