import {
  PlusOutlined,
  HomeOutlined,
  ContactsOutlined,
  ClusterOutlined,
  EditOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Card, Col, Divider, Input, Row, Tag, Tooltip } from 'antd';
import React, { useState, useRef } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import { history, Link, useModel, useRequest } from 'umi';
import Projects from './components/Projects';
import Articles from './components/Articles';
import Applications from './components/Applications';
import { queryCurrent } from './service';
import styles from './Center.less';
import { stringify } from 'querystring';
import Welcome from '@/pages/account/center/components/Welcome';
import Tools from '@/tools';
import _ from 'lodash';

const operationTabList = [
  {
    key: 'articles',
    tab: (
      <span>
        文章{' '}
        <span
          style={{
            fontSize: 14,
          }}
        >
          (8)
        </span>
      </span>
    ),
  },
  {
    key: 'applications',
    tab: (
      <span>
        应用{' '}
        <span
          style={{
            fontSize: 14,
          }}
        >
          (8)
        </span>
      </span>
    ),
  },
  {
    key: 'projects',
    tab: (
      <span>
        项目{' '}
        <span
          style={{
            fontSize: 14,
          }}
        >
          (8)
        </span>
      </span>
    ),
  },
  {
    key: 'welcome',
    tab: <span>欢迎</span>,
  },
];

const TagList = ({ tags }) => {
  const ref = useRef(null);
  const [newTags, setNewTags] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const showInput = () => {
    setInputVisible(true);

    if (ref.current) {
      // eslint-disable-next-line no-unused-expressions
      ref.current?.focus();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    let tempsTags = [...newTags];

    if (inputValue && tempsTags.filter((tag) => tag.label === inputValue).length === 0) {
      tempsTags = [
        ...tempsTags,
        {
          key: `new-${tempsTags.length}`,
          label: inputValue,
        },
      ];
    }

    setNewTags(tempsTags);
    setInputVisible(false);
    setInputValue('');
  };

  return (
    <div className={styles.tags}>
      <div className={styles.tagsTitle}>标签</div>
      {(tags || []).concat(newTags).map((item) => (
        <Tag key={item.key}>{item.label}</Tag>
      ))}
      {inputVisible && (
        <Input
          ref={ref}
          type="text"
          size="small"
          style={{
            width: 78,
          }}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      )}
      {!inputVisible && (
        <Tag
          onClick={showInput}
          style={{
            borderStyle: 'dashed',
          }}
        >
          <PlusOutlined />
        </Tag>
      )}
    </div>
  );
};

const Center = () => {
  const [tabKey, setTabKey] = useState('articles'); //  获取用户信息

  const { data: currentUser, loading } = useRequest(() => {
    return queryCurrent();
  }); //  渲染用户信息

  const renderUserInfo = ({ name, title, departments, address }) => {
    return (
      <div className={styles.detail}>
        {!!name && (
          <p>
            <UserOutlined
              style={{
                marginRight: 8,
              }}
            />
            {name}
          </p>
        )}
        {!!title && (
          <p>
            <ContactsOutlined
              style={{
                marginRight: 8,
              }}
            />
            {title}
          </p>
        )}
        <p>
          <ClusterOutlined
            style={{
              marginRight: 8,
            }}
          />
          {departments}
        </p>
        {/*<p>*/}
        {/*  <HomeOutlined*/}
        {/*    style={{*/}
        {/*      marginRight: 8,*/}
        {/*    }}*/}
        {/*  />*/}
        {/*  {*/}
        {/*    (*/}
        {/*      geographic || {*/}
        {/*        province: {*/}
        {/*          label: '',*/}
        {/*        },*/}
        {/*      }*/}
        {/*    ).province.label*/}
        {/*  }*/}
        {/*  {*/}
        {/*    (*/}
        {/*      geographic || {*/}
        {/*        city: {*/}
        {/*          label: '',*/}
        {/*        },*/}
        {/*      }*/}
        {/*    ).city.label*/}
        {/*  }*/}
        {/*</p>*/}
        {!!address && (
          <p>
            <HomeOutlined
              style={{
                marginRight: 8,
              }}
            />
            {address}
          </p>
        )}
      </div>
    );
  }; // 渲染tab切换

  const renderChildrenByTabKey = (tabValue) => {
    if (tabValue === 'projects') {
      return <Projects />;
    }

    if (tabValue === 'applications') {
      return <Applications />;
    }

    if (tabValue === 'articles') {
      return <Articles />;
    }

    if (tabValue === 'welcome') {
      return <Welcome />;
    }

    return null;
  };

  return (
    <GridContent>
      <Row gutter={24}>
        <Col lg={7} md={24}>
          <Card
            bordered={false}
            style={{
              marginBottom: 24,
            }}
            loading={loading}
          >
            {!loading && currentUser && (
              <div>
                <div className={styles.avatarHolder}>
                  <img alt="" src={Tools.getAvatarURL(currentUser)} />
                  <div className={styles.name}>
                    {currentUser.username || (
                      <div className={styles.no}>
                        <span>还没有昵称</span>
                        <Tooltip
                          title={'去设置'}
                          placement={'right'}
                          onClick={() => {
                            history.replace({ pathname: '/account/settings' });
                          }}
                        >
                          <EditOutlined style={{ marginLeft: 10, cursor: 'pointer' }} />
                        </Tooltip>
                      </div>
                    )}
                  </div>
                  <div>{currentUser?.signature || null}</div>
                </div>
                {renderUserInfo(currentUser)}
                <Divider dashed />
                <TagList tags={currentUser.tags || []} />
                <Divider
                  style={{
                    marginTop: 16,
                  }}
                  dashed
                />
                <div className={styles.team}>
                  <div className={styles.teamTitle}>团队</div>
                  <Row gutter={36}>
                    {currentUser.teams &&
                      currentUser.teams.map((item) => (
                        <Col key={item.id} lg={24} xl={12}>
                          <a href={item.href}>
                            <Avatar size="small" src={`/icons/cats/${_.random(1, 8)}.svg`} />
                            <span className={styles.teamName}>{item.name}</span>
                          </a>
                        </Col>
                      ))}
                  </Row>
                </div>
              </div>
            )}
          </Card>
        </Col>
        <Col lg={17} md={24}>
          <Card
            className={styles.tabsCard}
            bordered={false}
            tabList={operationTabList}
            activeTabKey={tabKey}
            onTabChange={(_tabKey) => {
              setTabKey(_tabKey);
            }}
          >
            {renderChildrenByTabKey(tabKey)}
          </Card>
        </Col>
      </Row>
    </GridContent>
  );
};

export default Center;
