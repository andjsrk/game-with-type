type Is<T extends U, U> = T
type AvailableKeys = 'w' | 'a' | 's' | 'd'
type Character = 'C'
type Empty = ' '
type GameMapItem = Character | Empty
type GameMapItemExcludeCharacter = Exclude<GameMapItem, Character>
type GameMapRow = Array<GameMapItem>
type GameMapType = Array<GameMapRow>
type Repeat<T, N extends number, Stored extends Array<T> = []> =
	Stored['length'] extends N
	 ? Stored
	 : Repeat<T, N, [ ...Stored, T ]>
type EmptyLine = Repeat<Empty, 11>
type InitialGameMap = Is<[
	EmptyLine,
	EmptyLine,
	[ ...Repeat<Empty, 5>, Character, ...Repeat<Empty, 5> ],
	EmptyLine,
	EmptyLine,
], GameMapType>
interface GameMapParseResult {
	front: Array<GameMapRow>
	curr: [ Array<GameMapItemExcludeCharacter>, Array<GameMapItemExcludeCharacter> ] | never
	back: Array<GameMapRow>
}
type FoundInTuple<Tuple extends Array<any>, T, Stored extends Array<any> = []> =
	Tuple extends [ infer Curr, ...infer Rest ]
	 ? Curr extends T
	  ? [ Stored, Rest ]
	  : FoundInTuple<Rest, T, [ ...Stored, Curr ]>
	 : [ Stored, [] ]
type ParsedGameMap<
	GameMap extends GameMapType,
	StoredRows extends Array<GameMapRow> = []
> =
	GameMap extends [ Is<infer Curr, GameMapRow>, ...Is<infer Rest, Array<GameMapRow>> ]
	 ? FoundInTuple<Curr, Character> extends [ Is<infer Front, Array<GameMapItemExcludeCharacter>>, Is<infer Back, Array<GameMapItemExcludeCharacter>> ]
	  ? Back extends []
	   ? ParsedGameMap<Rest, [ ...StoredRows, Curr ]>
	   :
			Is<{
				front: StoredRows
				curr: [ Front, Back ]
				back: Rest
			}, GameMapParseResult>
	   : never
	 :
		Is<{
			front: StoredRows
			curr: never
			back: []
		}, GameMapParseResult>
type ProcessKey<K extends string, GameMap extends GameMapType> =
	K extends AvailableKeys
	 ?
		{
			'w':
				ParsedGameMap<GameMap> extends Is<infer ParseResult, GameMapParseResult>
				 ? ParseResult['front'] extends []
				  ? GameMap
				  : ParseResult['front'] extends [ ...infer Rest, infer _ ]
				   ? [ ...Rest, [ ...ParseResult['curr'][0], Character, ...ParseResult['curr'][1] ], ...ParseResult['back'], EmptyLine ]
				   : never
				 : never
			'a':
				ParsedGameMap<GameMap> extends Is<infer ParseResult, GameMapParseResult>
				 ? ParseResult['curr'][0] extends []
				  ? GameMap
				  : ParseResult['curr'][0] extends [ ...infer Rest, infer _ ]
				   ? [ ...ParseResult['front'], [ ...Rest, Character, ...ParseResult['curr'][1], Empty ], ...ParseResult['back'] ]
				   : never
				 : never
			's':
				ParsedGameMap<GameMap> extends Is<infer ParseResult, GameMapParseResult>
				 ? ParseResult['back'] extends []
				  ? GameMap
				  : ParseResult['back'] extends [ infer _, ...infer Rest ]
				   ? [ EmptyLine, ...ParseResult['front'], [ ...ParseResult['curr'][0], Character, ...ParseResult['curr'][1] ], ...Rest ]
				   : never
				 : never
			'd':
				ParsedGameMap<GameMap> extends Is<infer ParseResult, GameMapParseResult>
				 ? ParseResult['curr'][1] extends []
				  ? GameMap
				  : ParseResult['curr'][1] extends [ infer _, ...infer Rest ]
				   ? [ ...ParseResult['front'], [ Empty, ...ParseResult['curr'][0], Character, ...Rest ], ...ParseResult['back'] ]
				   : never
				 : never
		}[K]
	 : GameMap
type ProcessInput<Input extends string, GameMap extends GameMapType> =
	Input extends `${infer FirstChar}${infer Rest}`
	 ? ProcessInput<Rest, ProcessKey<FirstChar, GameMap>>
	 : GameMap
type ConcatToStr<StrTuple extends Array<string>> =
	StrTuple extends [ Is<infer Curr, string>, ...Is<infer Rest, Array<string>> ]
	 ? `${Curr}${ConcatToStr<Rest>}`
	 : ''
type RenderGameMapRow<Row extends GameMapRow> = ConcatToStr<Row>
type SplitStrEachChar<Str extends string> =
	Str extends `${infer First}${infer Rest}`
	 ? [ First, ...SplitStrEachChar<Rest> ]
	 : []
type ZFill<Str extends string, Length extends number> =
	SplitStrEachChar<Str>['length'] extends Length
	 ? Str
	 : ZFill<`0${Str}`, Length>
type RenderGameMap<GameMap extends GameMapType, RenderedRowCounter extends Array<never> = []> =
	GameMap extends [ Is<infer Curr, GameMapRow>, ...Is<infer Rest, GameMapType> ]
	 ?
		{
			[_ in
				[ ...GameMap, ...RenderedRowCounter ] extends Is<infer Concated, Array<GameMapRow>>
				 ? [ ...RenderedRowCounter, never ] extends Is<infer OneIncreasedTuple, Array<never>>
				  ? `${ZFill<`${OneIncreasedTuple['length']}`, SplitStrEachChar<`${Concated['length']}`>['length']>} `
				  : never
				 : never
			]: RenderGameMapRow<Curr>
		} & RenderGameMap<Rest, [ ...RenderedRowCounter, never ]>
	 : {}
type Expand<O extends object> = { [K in keyof O]: O[K] }
export type Game<Input extends string> =
	Expand<RenderGameMap<ProcessInput<Input, InitialGameMap>>>
