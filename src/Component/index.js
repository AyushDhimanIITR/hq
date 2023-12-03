import React, { useEffect, useState } from "react";
import "./style.css";
import { Divider, Form, Input, InputNumber, Popconfirm, Table, Typography } from "antd";

import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const Main = () => {

    const [data, setData] = useState([]);
    const [query, setQuery] = useState("");
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState("");

    const EditableCell = ({
        editing,
        dataIndex,
        title,
        inputType,
        record,
        index,
        children,
        ...restProps
    }) => {
        const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item
                        name={dataIndex}
                        style={{
                            margin: 0,
                        }}
                        rules={[
                            {
                                required: true,
                                message: `Please Input ${title}!`,
                            },
                        ]}
                    >
                        {inputNode}
                    </Form.Item>
                ) : (
                    children
                )}
            </td>
        );
    };

    const isEditing = (record) => record.id === editingKey;
    const edit = (record) => {
        form.setFieldsValue({
            name: '',
            email: '',
            role: '',
            ...record,
        });
        setEditingKey(record.id);
    };

    const save = async (id) => {
        try {
            const row = await form.validateFields();
            const newData = [...data];
            const index = newData.findIndex((item) => id === item.id);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, { ...item, ...row });
                setData(newData);
                setEditingKey('');
            } else {
                newData.push(row);
                setData(newData);
                setEditingKey('');
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const cancel = () => {
        setEditingKey('');
    };

    const handleDelete = (key) => {
        const newData = data.filter((item) => item.id !== key);
        setData(newData);
      };

    const column = [
        {
            title: "id",
            dataIndex: "id",
            // editable: true,
        },
        {
            title: "Name",
            dataIndex: "name",
            editable: true,
        },
        {
            title: "Email",
            dataIndex: "email",
            editable: true,
        },
        {
            title: "Role",
            dataIndex: "role",
            editable: true,
        },
        {
            title: "Actions",
            dataIndex: "Actions",
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <Typography.Link
                            onClick={() => save(record.id)}
                            style={{
                                marginRight: 8,
                            }}
                        >
                            Save
                        </Typography.Link>
                        <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                            <a>Cancel</a>
                        </Popconfirm>
                    </span>
                ) : (
                    <>
                    <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
                        <EditOutlined />
                    </Typography.Link>
                    <Divider type="vertical" />
                    <Typography.Link onClick={() => handleDelete(record.id)}>
                        <DeleteOutlined />
                    </Typography.Link>
                    </>
                );
            },
        }
    ]

    const mergedColumns = column.map((col) => {
        if (!col.editable) {
          return col;
        }
        return {
          ...col,
          onCell: (record) => ({
            record,
            inputType: col.dataIndex === 'text',
            dataIndex: col.dataIndex,
            title: col.title,
            editing: isEditing(record),
          }),
        };
      });

    const search = (data) => {
        return data.filter((row) =>
        (
            row.id.toLowerCase().includes(query.toLowerCase()) ||
            row.role.toLowerCase().includes(query.toLowerCase()) ||
            row.email.toLowerCase().includes(query.toLowerCase()) ||
            row.name.toLowerCase().includes(query.toLowerCase())
        )
        )
    };

    // const column = columns(editingKey, isEditing, edit, cancel, form);

    useEffect(() => {
        (async () => {
            const res = await fetch("https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json");
            const response = await res.json();
            setData(response);
            console.log(response);
        })();
    }, []);

    return (
        <div className="main">
            <h1>Admin Dashboard</h1>
            <div className="searchBar">
                <form>
                    <input
                        type="text"
                        className="searchInput"
                        placeholder="Search..."
                        onChange={(e) => {
                            setQuery(e.target.value);
                        }}
                    />
                    {/* <button type="submit">
                <img className="searchIcon" alt=""  />
              </button> */}
                </form>
            </div>
            <Form form={form} component={false}>
            <Table className="table" rowSelection={{ type: "checkbox" }} columns={mergedColumns}
                dataSource={search(data)} components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
            />
            </Form>
        </div>
    )
}

export default Main;