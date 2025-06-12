export default [
  {
    url: "/api/history",
    method: "get",
    response: () => {
      return [
        {


        
          id: "1",
          query: "카카오",
          searchedAt: "2025-06-12T12:00:00",
          resultJson: JSON.stringify([
            {
              title: "카카오 뉴스1",
              originallink: "https://test1",
              link: "https://test1",
              description: "내용1",
              pubDate: "2025-06-11",
              id: "n1"
            },
            {
              title: "카카오 뉴스2",
              originallink: "https://test2",
              link: "https://test2",
              description: "내용2",
              pubDate: "2025-06-11",
              id: "n2"
            }


            



          ])


















        }
      ];
    }
  }
];

/*


export default [
  {
    url: "/api/history",
    method: "get",
    response: () => {
      return [
        {
          id: "1",
          query: "카카오",
          searchedAt: "2025-06-12T12:00:00",
          resultJson: JSON.stringify([
            {
              title: "카카오 뉴스1",
              originallink: "https://test1",
              link: "https://test1",
              description: "내용1",
              pubDate: "2025-06-11",
              id: "n1"
            },
            {
              title: "카카오 뉴스2",
              originallink: "https://test2",
              link: "https://test2",
              description: "내용2",
              pubDate: "2025-06-11",
              id: "n2"
            }
          ])
        },
        {
          id: "2",
          query: "삼성전자",
          searchedAt: "2025-06-13T10:30:00",
          resultJson: JSON.stringify([
            {
              title: "삼성전자 뉴스1",
              originallink: "https://samsung1",
              link: "https://samsung1",
              description: "삼성전자 관련 뉴스1",
              pubDate: "2025-06-13",
              id: "s1"
            },
            {
              title: "삼성전자 뉴스2",
              originallink: "https://samsung2",
              link: "https://samsung2",
              description: "삼성전자 관련 뉴스2",
              pubDate: "2025-06-13",
              id: "s2"
            }
          ])
        }
      ];
    }
  }
];


*/