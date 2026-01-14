
import { TaskStatus, AppState } from './types';

export const INITIAL_MEMBERS = [
  '佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村'
];

export const INITIAL_STATE: AppState = {
  events: [
    {
      id: '001',
      title: '食品模擬店（チュロス）',
      description: '中庭12番テントで実施する食品販売イベント',
      isFinished: false,
      leaderNames: ['佐藤'],
      tasks: [
        {
          id: 't1',
          title: '保健所への申請',
          description: '必要書類の作成と提出',
          status: TaskStatus.DONE,
          priority: 'HIGH',
          isHelpRequired: false,
          assignees: ['佐藤'],
          startDate: '2024-09-01',
          endDate: '2024-09-10',
          endTime: '17:00',
          progress: 100
        }
      ],
      meetings: []
    },
    {
      id: '002',
      title: 'メインステージ設営',
      description: '体育館の音響・照明・ステージの組み立て',
      isFinished: false,
      leaderNames: ['鈴木', '田中'],
      tasks: [
        {
          id: 't1',
          title: 'アンプの動作確認',
          description: 'スピーカーとの接続テスト',
          status: TaskStatus.IN_PROGRESS,
          priority: 'MEDIUM',
          isHelpRequired: true,
          assignees: ['鈴木'],
          startDate: '2024-10-01',
          endDate: '2024-10-05',
          endTime: '18:00',
          progress: 40
        }
      ],
      meetings: []
    }
  ],
  attendance: [],
  members: INITIAL_MEMBERS,
  messages: [],
  schedules: [
    {
      id: 's1',
      title: '全体進捗会議',
      date: '2024-11-20',
      time: '16:00',
      description: '各企画の進捗報告と予算調整',
      createdBy: '実行委員長'
    }
  ],
  memberStatuses: {}
};

export const FAQ_DATA = [
  { id: 'f1', q: "イベントIDとは何ですか？", a: "各企画や部署に割り振られた3桁の数字です。ダッシュボード上部の入力欄に打ち込むことで、一瞬で管理画面に移動できます。" },
  { id: 'f2', q: "権限（ロール）の違いは？", a: "先生は全企画の閲覧と統計の確認ができます。生徒リーダーは担当企画の編集ができます。スタッフは自分のタスク管理ができます。" },
  { id: 'f3', q: "勤怠入力はいつ行えばいいですか？", a: "準備活動に参加する時に「集合」、帰宅する時に「解散」を押してください。" },
  { id: 'f4', q: "企画のリーダーを変更するには？", a: "現在は初期設定の生徒が固定されています。変更が必要な場合は先生権限者に依頼してください。" },
  { id: 'f5', q: "終了予定を過ぎたタスクを再開するには？", a: "タスク詳細画面から「終了予定日時」を未来の日付に変更するか、進捗率を100%未満に調整してください。" }
];

export const GUIDE_DATA = [
  {
    id: 'g1',
    title: '番号での企画アクセス（ジャンプ機能）',
    steps: [
      'ダッシュボードにあるテンキーで、企画に割り当てられた3桁のIDを入力します。',
      '入力が完了すると自動的にその企画の専用ページ（タスク・ガントチャート等）が開きます。',
      '戻りたい時はナビゲーションの「ホーム」をクリックしてください。'
    ]
  },
  {
    id: 'g2',
    title: '場所別の勤怠打刻システム',
    steps: [
      '「勤怠・稼働」タブを開きます。',
      '「体育館」「買い出し」「教室」「その他」から現在の場所を選択します。',
      '「集合」ボタンを押すと打刻完了です。移動した際は再度場所を選んで「集合」を押すと上書きされます。'
    ]
  },
  {
    id: 'g3',
    title: '先生専用：勤務統計の見方',
    steps: [
      '先生権限でログインし、パスワードを入力して統計ページを開きます。',
      '生徒ごとの稼働時間や場所の履歴を確認できます。',
      '活動状況の偏りがないか、過重労働になっていないかをチェックしましょう。'
    ]
  }
];
