import { useEffect, useRef, useCallback } from 'react';
import { Card, Layout, List, Space, Spin, Tag } from 'antd';
import { useAppDispatch, useAppSelector } from './hooks';
import { fetchNews } from './redux/newsSlice';

const { Content } = Layout;

const App = () => {
  const dispatch = useAppDispatch();

  const { news, hasMore, loading } = useAppSelector((state) => state.news);

  const observer = useRef<IntersectionObserver | null>(null);

  const skipRef = useRef(0);
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (!didFetchRef.current) {
      dispatch(fetchNews(skipRef.current));
      skipRef.current += 10;
      didFetchRef.current = true;
    }
  }, [dispatch]);

  const lastNewsItemRef = useCallback(
    (node: Element | null) => {
      if (loading) {
        return;
      }

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          dispatch(fetchNews(skipRef.current));
          skipRef.current += 10;
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [loading, hasMore, dispatch]
  );

  return (
    <Layout style={{ padding: 20 }}>
      <Content>
        <List
          dataSource={news}
          loading={loading}
          renderItem={(item, idx) => {
            const isLast = idx === news.length - 1;
            return (
              <List.Item
                key={item.id}
                ref={isLast ? lastNewsItemRef : null}
                style={{
                  padding: 0,
                  marginBottom: isLast ? 0 : 20,
                }}
              >
                <Card title={item.title} style={{ width: '100%' }}>
                  <p
                    style={{
                      marginBottom: 10,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.body}
                  </p>
                  <div style={{ marginBottom: 10 }}>
                    {item.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                  <Space>
                    <Tag color="green">👍 {item.reactions.likes}</Tag>
                    <Tag color="red">👎 {item.reactions.dislikes}</Tag>
                  </Space>
                </Card>
              </List.Item>
            );
          }}
        />

        {loading && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Spin />
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default App;
