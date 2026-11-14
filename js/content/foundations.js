// Section 1: Programming Foundations. Lesson content keyed by lesson id.
// Text style: plain strings, `backticks` for inline code, **bold**. Code samples are template literals.

export default {
  'foundations-introduction-to-luau': {
    intro: 'Every Roblox game is powered by code. In this lesson you will write your very first lines of Luau, the language Roblox uses, and see them run. You do not need any experience.',
    explain: [
      ['p', 'A **program** is a list of instructions. The computer follows them from the top to the bottom, one line at a time. **Luau** is the language you write those instructions in. In Roblox, Luau code makes things happen: it moves parts, gives out coins and opens menus.'],
      ['code', 'print("Hello, Roblox!")', 'Your first instruction.'],
      ['p', '`print` is a **function**, which means a ready-made tool. The brackets `( )` hold what you hand to the tool. The quote marks `" "` show that Hello, Roblox! is **text**. This line shows that text in the output.'],
      ['tip', 'In Roblox Studio, printed text appears in the Output window. Here it appears in the box under your code when you press Run.'],
    ],
    checks: [
      ['What does `print("Hi")` do?', ['It shows the word Hi in the output', 'It saves your game', 'It deletes a line of code'], 0, 'print shows what is inside the brackets in the output. It does not save or delete anything.'],
      ['In what order does Luau run your lines?', ['In a random order', 'From the top to the bottom, one line at a time', 'From the bottom to the top'], 1, 'A program runs from the top down. That is why the order of your lines matters.'],
    ],
    exercises: [
      { title: 'Say hello', task: 'The code below prints the wrong message. Change it so it prints exactly: Hello, Luau!', starter: 'print("Hello, world!")', out: ['Hello, Luau!'], hint: 'Only the words between the quote marks need to change. Keep the quote marks and the brackets.', solution: 'print("Hello, Luau!")' },
      { title: 'Two lines', task: 'Print two lines, one after the other. The first must say: I am learning Luau\nThe second must say: Roblox, here I come', starter: '-- Write two print lines below\n', out: ['I am learning Luau', 'Roblox, here I come'], need: [[/print\s*\([^]*print\s*\(/, 'two separate print lines']], hint: 'Use one print(...) for each line. Put each message in its own quote marks.', solution: 'print("I am learning Luau")\nprint("Roblox, here I come")' },
    ],
    challenge: { title: 'Welcome banner', task: 'Print a three line welcome banner for your game, using one print for each line:\nWelcome to my game\nGet ready to play\nGood luck!', starter: '-- Print the three lines of the banner\n', out: ['Welcome to my game', 'Get ready to play', 'Good luck!'], need: [[/print\s*\([^]*print\s*\([^]*print\s*\(/, 'three separate print lines']], hint: 'Copy the pattern from the last exercise and add a third print. Check every capital letter and the exclamation mark.', solution: 'print("Welcome to my game")\nprint("Get ready to play")\nprint("Good luck!")' },
  },

  'foundations-printing-and-comments': {
    intro: 'Printing is how you see what your code is doing, and comments let you leave notes for yourself. Together they make code easier to understand and to fix.',
    explain: [
      ['p', 'You can print text, numbers and the answer to a sum. Numbers do not need quote marks. Text does.'],
      ['code', 'print("Coins:")\nprint(5 + 3)\nprint("5 + 3")', 'The second line prints 8. The third prints the text 5 + 3, because it is inside quote marks.'],
      ['p', 'You can give print several things at once by separating them with commas. They appear next to each other with a gap between them.'],
      ['code', 'print("Level", 4)', 'Shows: Level 4'],
      ['p', 'A **comment** is a note for humans. The computer ignores everything after `--` on a line.'],
      ['code', '-- This line is a comment\nprint("Hi") -- this note is ignored too\n--[[ A longer note\n    over many lines ]]', 'Single line and multi-line comments.'],
    ],
    checks: [
      ['What does a comment do?', ['Runs the line twice', 'Is ignored by the computer and is only a note for people', 'Prints text on the screen'], 1, 'Anything after -- is skipped. Comments explain your code to you and other people.'],
      ['What does `print("5 + 3")` show?', ['8', '5 + 3', 'An error'], 1, 'Quote marks turn everything inside into plain text, so the sum is not worked out. Without quote marks, print(5 + 3) shows 8.'],
    ],
    exercises: [
      { title: 'Print a sum', task: 'Print the answer to 12 multiplied by 3 (use * for multiply). Also include a comment line that starts with --.', starter: '-- Add your comment, then print the answer\n', out: ['36'], need: [[/12\s*\*\s*3/, 'the sum 12 * 3 written as a calculation']], rawNeed: [[/^\s*--[^\n]*\n[^]*|\S.*--/m, 'a comment']], hint: 'Write print(12 * 3). Numbers do not need quote marks.', solution: '-- Work out 12 times 3\nprint(12 * 3)' },
      { title: 'Fix the broken line', task: 'This code has a mistake, so it cannot run. Fix it so it prints: Roblox is fun', starter: 'print("Roblox is fun)', broken: true, out: ['Roblox is fun'], hint: 'Every opening quote mark needs a closing quote mark.', solution: 'print("Roblox is fun")' },
    ],
    challenge: { title: 'Game info card', task: 'Print an info card with exactly three lines:\nGame: Obby Run\nMax players: 12\nCoins per round: 100\n\nThe third line must work out 100 from the sum 25 * 4 (print the label and the sum together with a comma). Add a comment too.', starter: '-- Print the info card\n', out: ['Game: Obby Run', 'Max players: 12', 'Coins per round: 100'], need: [[/25\s*\*\s*4/, 'the sum 25 * 4']], rawNeed: [[/--/, 'a comment']], hint: 'For the last line use print("Coins per round:", 25 * 4). The comma puts a gap between the text and the number.', solution: '-- Info card for the game\nprint("Game: Obby Run")\nprint("Max players: 12")\nprint("Coins per round:", 25 * 4)' },
  },

  'foundations-variables': {
    intro: 'A variable is a labelled box that holds a value, so you can use it again and change it later. Nearly every Roblox script uses them for things like health, coins and names.',
    explain: [
      ['p', 'You create a variable with the word `local`, then a name, then `=`, then the value you want to store.'],
      ['code', 'local coins = 10\nprint(coins)', 'Creates a box called coins that holds 10, then prints what is inside.'],
      ['p', 'To change the value later, write the name and `=` again. You only use `local` the first time.'],
      ['code', 'local health = 100\nhealth = 70\nprint(health) -- 70', ''],
      ['p', 'A name can use letters, numbers and underscores, but it cannot start with a number or contain spaces. Capital letters matter: `Coins` and `coins` are two different variables. A common style is `playerName` (a small first word, then capitals).'],
    ],
    checks: [
      ['What does `local coins = 10` do?', ['Prints 10', 'Creates a variable called coins that holds 10', 'Deletes coins'], 1, 'local creates a new variable. The = puts the value 10 inside it.'],
      ['Which is a valid variable name?', ['my coins', '2coins', 'my_coins'], 2, 'Names cannot contain spaces or start with a number. Underscores are fine.'],
    ],
    exercises: [
      { title: 'Create a variable', task: 'Create a variable called playerName that holds the text Builder, then print it.', starter: '-- Create playerName, then print it\n', out: ['Builder'], need: [[/local\s+playerName\s*=/, 'a variable called playerName created with local']], hint: 'local playerName = "Builder" then print(playerName). No quote marks around playerName when printing.', solution: 'local playerName = "Builder"\nprint(playerName)' },
      { title: 'Change a value', task: 'The player takes 30 damage. Change health so it holds 70, then print it. Do not create a second variable.', starter: 'local health = 100\n-- change health here\nprint(health)', out: ['70'], need: [[/health\s*=[^=][^]*health\s*=[^=]/, 'a line that changes health (without local)']], avoid: [[/local\s+health[^]*local\s+health/, 'Use health = ... to change it. Writing local again would make a brand new variable.']], hint: 'Write health = 70 on its own line, without the word local.', solution: 'local health = 100\nhealth = 70\nprint(health)' },
    ],
    challenge: { title: 'Score keeper', task: 'Make a variable called score that starts at 0. Add 10 to it, then add 5 more (change the variable each time). Finally print the label and the score so it shows: Score: 15', starter: '-- Build the score keeper\n', out: ['Score: 15'], need: [[/local\s+score\s*=\s*0/, 'a variable score that starts at 0']], hint: 'score = score + 10 means: take what is in score, add 10, and store it back. Do that twice, then print("Score:", score).', solution: 'local score = 0\nscore = score + 10\nscore = score + 5\nprint("Score:", score)' },
  },

  'foundations-data-types': {
    intro: 'Every value in Luau has a type: a kind of thing it is. Knowing the types helps you avoid mistakes, because different types behave differently.',
    explain: [
      ['p', 'These are the basic types:'],
      ['code', 'local level = 7          -- number\nlocal name = "Alex"      -- string (text)\nlocal isAdmin = false    -- boolean (true or false)\nlocal pet = nil          -- nil (nothing at all)', ''],
      ['p', 'Quote marks make a **string**, which is text. So `"42"` is text, but `42` is a number. A **boolean** is only ever `true` or `false`. **nil** means there is no value. A fifth type, the **table**, holds many values. You will meet it soon.'],
      ['p', 'Use `typeof` to ask a value what type it is.'],
      ['code', 'print(typeof(42))      -- number\nprint(typeof("42"))    -- string', ''],
    ],
    checks: [
      ['What type is "42" (with quote marks)?', ['number', 'string', 'boolean'], 1, 'Anything inside quote marks is text, even if it looks like a number.'],
      ['Which value is a boolean?', ['"true"', 'true', '1'], 1, 'true without quote marks is a boolean. "true" in quote marks is just text.'],
    ],
    exercises: [
      { title: 'Ask for the type', task: 'Print the type of each value on its own line, using typeof: first 3.14, then "hello", then true.', starter: '-- Print three types\n', out: ['number', 'string', 'boolean'], need: [[/typeof\s*\([^]*typeof\s*\([^]*typeof\s*\(/, 'three typeof calls']], hint: 'print(typeof(3.14)) shows number. Do the same for "hello" and true.', solution: 'print(typeof(3.14))\nprint(typeof("hello"))\nprint(typeof(true))' },
      { title: 'Fix the type', task: 'level should be a number, but it was written as text. Fix it so the code prints number.', starter: 'local level = "5"\nprint(typeof(level))', out: ['number'], hint: 'Remove the quote marks around 5.', solution: 'local level = 5\nprint(typeof(level))' },
    ],
    challenge: { title: 'Type detective', task: 'These four variables are set up for you. Print the type of each one, in the order they are listed, one per line. Use typeof.', starter: 'local playerName = "Alex"\nlocal level = 7\nlocal isAdmin = false\nlocal pet = nil\n\n-- Print the type of each variable\n', out: ['string', 'number', 'boolean', 'nil'], need: [[/typeof\s*\([^]*typeof\s*\([^]*typeof\s*\([^]*typeof\s*\(/, 'four typeof calls']], hint: 'print(typeof(playerName)) first, then level, isAdmin and pet.', solution: 'local playerName = "Alex"\nlocal level = 7\nlocal isAdmin = false\nlocal pet = nil\n\nprint(typeof(playerName))\nprint(typeof(level))\nprint(typeof(isAdmin))\nprint(typeof(pet))' },
  },

  'foundations-strings': {
    intro: 'Strings are text, and they are everywhere: player names, chat messages, item labels. You will learn to join, measure and change them.',
    explain: [
      ['p', 'Join strings with `..` (two dots). This is called **concatenation**. Numbers can be joined too.'],
      ['code', 'local name = "Sam"\nprint("Hello, " .. name .. "!")  -- Hello, Sam!', 'Remember the space inside the quotes.'],
      ['p', 'A neater way is a **backtick string**. Put variables inside curly brackets and they are filled in for you.'],
      ['code', 'local coins = 25\nprint(`{name} has {coins} coins`)', 'Uses the backtick key ` rather than a quote mark.'],
      ['p', 'Put `#` in front of a string to count its characters. Strings also have helpers such as `:upper()` and `:lower()`.'],
      ['code', 'local word = "Roblox"\nprint(#word)         -- 6\nprint(word:upper())  -- ROBLOX', ''],
    ],
    checks: [
      ['Which line prints Hello, Sam! when name is "Sam"?', ['print("Hello, " .. name .. "!")', 'print("Hello, " + name + "!")', 'print(Hello, name)'], 0, 'Joining text uses .. and not +. Luau would report an error if you used + with text.'],
      ['What does `#"Roblox"` give?', ['5', '6', '"Roblox"'], 1, 'R-o-b-l-o-x is six characters.'],
    ],
    exercises: [
      { title: 'Join names', task: 'Use .. to print the full name with a space between the two parts: Block Master', starter: 'local first = "Block"\nlocal second = "Master"\n-- Print the full name\n', out: ['Block Master'], need: [[/\.\./, 'the .. joining operator']], hint: 'print(first .. " " .. second) joins three pieces: the first name, a space in quotes, and the second name.', solution: 'local first = "Block"\nlocal second = "Master"\nprint(first .. " " .. second)' },
      { title: 'Shout and count', task: 'Print the username in capital letters, then on the next line print how many characters it has.', starter: 'local username = "builder99"\n-- 1) print it in capitals\n-- 2) print its length\n', out: ['BUILDER99', '9'], need: [[/upper/, ':upper() or string.upper'], [/#|len/, 'the # length operator']], hint: 'print(username:upper()) and print(#username).', solution: 'local username = "builder99"\nprint(username:upper())\nprint(#username)' },
    ],
    challenge: { title: 'Welcome message', task: 'Using the two variables, print exactly: Welcome, Sam! You have 25 coins.\nUse .. or a backtick string, so the message changes if the variables change.', starter: 'local playerName = "Sam"\nlocal coins = 25\n\n-- Print the welcome message\n', out: ['Welcome, Sam! You have 25 coins.'], need: [[/\.\.|`/, 'joining (..) or a backtick string']], vary: [{ say: 'playerName is Kai and coins is 3', set: [[/local playerName = "Sam"/, 'local playerName = "Kai"'], [/local coins = 25/, 'local coins = 3']], out: ['Welcome, Kai! You have 3 coins.'] }], hint: 'Try: print("Welcome, " .. playerName .. "! You have " .. coins .. " coins.")', solution: 'local playerName = "Sam"\nlocal coins = 25\nprint("Welcome, " .. playerName .. "! You have " .. coins .. " coins.")' },
  },

  'foundations-arithmetic-and-operators': {
    intro: 'Games are full of maths: damage, prices, timers and scores. Luau gives you operators, which are small symbols that do the calculations for you.',
    explain: [
      ['code', 'print(10 + 5)  -- 15 add\nprint(10 - 5)  -- 5 subtract\nprint(10 * 5)  -- 50 multiply\nprint(10 / 4)  -- 2.5 divide\nprint(2 ^ 3)   -- 8 power\nprint(10 % 3)  -- 1 remainder\nprint(10 // 3) -- 3 divide and round down', ''],
      ['p', '`%` gives the **remainder** left over after dividing. `//` divides and drops the decimals. Maths follows the usual order: multiply and divide first, then add and subtract. Use brackets to choose the order yourself.'],
      ['code', 'print(2 + 3 * 4)    -- 14\nprint((2 + 3) * 4)  -- 20', ''],
      ['p', 'A shortcut for changing a variable: `score += 5` means the same as `score = score + 5`. It also works with `-=`, `*=` and `/=`.'],
    ],
    checks: [
      ['What does `2 + 3 * 4` give?', ['20', '14', '24'], 1, 'Multiplication happens first: 3 * 4 = 12, then 2 + 12 = 14. Brackets would change that.'],
      ['What does `10 % 3` give?', ['3', '1', '3.33'], 1, '3 goes into 10 three times (9) and 1 is left over. % gives that leftover.'],
    ],
    exercises: [
      { title: 'Shop total', task: 'A sword costs 15 coins and the player buys 4. Print the total cost, then on the next line print how much is left from 100 coins. Use the variables.', starter: 'local price = 15\nlocal quantity = 4\nlocal wallet = 100\n-- print the total, then the coins left\n', out: ['60', '40'], vary: [{ say: 'price is 10', set: [[/local price = 15/, 'local price = 10']], out: ['40', '60'] }], hint: 'The total is price * quantity. Coins left is wallet - (price * quantity).', solution: 'local price = 15\nlocal quantity = 4\nlocal wallet = 100\nprint(price * quantity)\nprint(wallet - price * quantity)' },
      { title: 'Groups and leftovers', task: 'There are 17 players and each team needs 5. Print how many full teams there are, then how many players are left over. Use // and %.', starter: 'local players = 17\nlocal teamSize = 5\n-- full teams first, then leftovers\n', out: ['3', '2'], need: [[/\/\//, 'the // operator'], [/%/, 'the % operator']], hint: 'players // teamSize gives the full teams. players % teamSize gives the leftover players.', solution: 'local players = 17\nlocal teamSize = 5\nprint(players // teamSize)\nprint(players % teamSize)' },
    ],
    challenge: { title: 'Pizza party', task: 'There are 23 guests and each table seats 4. Print two lines:\nFull tables: 5\nLeft over: 3\nWork both numbers out from the variables with maths, then use .. or a comma to build each line.', starter: 'local guests = 23\nlocal seats = 4\n\n-- Print both lines\n', out: ['Full tables: 5', 'Left over: 3'], need: [[/\/\//, '//'], [/%/, '%']], vary: [{ say: 'guests is 10', set: [[/local guests = 23/, 'local guests = 10']], out: ['Full tables: 2', 'Left over: 2'] }], hint: 'print("Full tables:", guests // seats) and print("Left over:", guests % seats).', solution: 'local guests = 23\nlocal seats = 4\nprint("Full tables:", guests // seats)\nprint("Left over:", guests % seats)' },
  },

  'foundations-conditionals': {
    intro: 'Conditionals let your code make decisions: show a warning when health is low, or open a door only for the right player. They make a game react to what is happening.',
    explain: [
      ['p', 'An `if` statement runs its code only when a condition is true. Always finish it with `end`.'],
      ['code', 'local health = 25\nif health < 30 then\n  print("Low health!")\nend', 'The print only runs because 25 is less than 30.'],
      ['p', 'Add `else` for the other case, and `elseif` to check more conditions. Luau tries them from the top and runs the first one that is true.'],
      ['code', 'if health < 30 then\n  print("Danger")\nelseif health < 70 then\n  print("Hurt")\nelse\n  print("Healthy")\nend', ''],
      ['p', 'To compare, use `==` (equal), `~=` (not equal), `<`, `>`, `<=`, `>=`. One `=` stores a value. Two `==` ask a question.'],
    ],
    checks: [
      ['What does `==` do?', ['Stores a value in a variable', 'Checks whether two values are equal', 'Adds two numbers'], 1, 'A single = stores. A double == compares and gives true or false.'],
      ['With health = 50, which message prints? if health < 30 then A elseif health < 70 then B else C end', ['A', 'B', 'C'], 1, '50 is not below 30, so A is skipped. 50 is below 70, so B runs and the rest is ignored.'],
    ],
    exercises: [
      { title: 'Low health warning', task: 'Print Low health! if health is below 30. Otherwise print Healthy. Your code must use the variable, not a fixed message.', starter: 'local health = 25\n-- decide what to print\n', out: ['Low health!'], need: [[/\bif\b[^]*\bthen\b/, 'an if ... then statement']], vary: [{ say: 'health is 80', set: [[/local health = \d+/, 'local health = 80']], out: ['Healthy'] }], hint: 'if health < 30 then print("Low health!") else print("Healthy") end', solution: 'local health = 25\nif health < 30 then\n  print("Low health!")\nelse\n  print("Healthy")\nend' },
      { title: 'Grade it', task: 'Print a grade for the score: A for 90 or more, B for 80 or more, otherwise C. Use elseif.', starter: 'local score = 85\n-- print A, B or C\n', out: ['B'], need: [[/elseif/, 'elseif']], vary: [{ say: 'score is 95', set: [[/local score = \d+/, 'local score = 95']], out: ['A'] }, { say: 'score is 40', set: [[/local score = \d+/, 'local score = 40']], out: ['C'] }], hint: 'Check the highest grade first: if score >= 90 then ... elseif score >= 80 then ... else ... end', solution: 'local score = 85\nif score >= 90 then\n  print("A")\nelseif score >= 80 then\n  print("B")\nelse\n  print("C")\nend' },
    ],
    challenge: { title: 'The item shop', task: 'A player has coins and an item has a price. If the player can afford it print: Purchased! Coins left: N (with the coins that remain). If not, print: Not enough coins. You need N more (with how many more coins are needed).', starter: 'local coins = 40\nlocal price = 50\n\n-- decide and print\n', out: ['Not enough coins. You need 10 more'], vary: [{ say: 'coins is 80', set: [[/local coins = \d+/, 'local coins = 80']], out: ['Purchased! Coins left: 30'] }, { say: 'coins is 50', set: [[/local coins = \d+/, 'local coins = 50']], out: ['Purchased! Coins left: 0'] }], hint: 'if coins >= price then print("Purchased! Coins left:", coins - price) else print("Not enough coins. You need", price - coins, "more") end', solution: 'local coins = 40\nlocal price = 50\nif coins >= price then\n  print("Purchased! Coins left:", coins - price)\nelse\n  print("Not enough coins. You need", price - coins, "more")\nend' },
  },

  'foundations-boolean-logic': {
    intro: 'Real decisions often depend on more than one thing: does the player have a ticket and is old enough? Boolean logic lets you combine conditions.',
    explain: [
      ['p', 'A boolean is `true` or `false`. Three words combine them:'],
      ['code', 'print(true and false)  -- false (both must be true)\nprint(true or false)   -- true  (at least one is true)\nprint(not true)        -- false (flips it)', ''],
      ['code', 'local level = 12\nlocal hasPass = true\nif level >= 10 and hasPass then\n  print("Allowed")\nend', 'Both parts must be true.'],
      ['p', 'In Luau only `false` and `nil` count as false. Everything else, even 0, counts as true. That lets you give a **default value** with `or`:'],
      ['code', 'local nickname = nil\nprint(nickname or "Guest")  -- Guest', 'If nickname is nil, the or picks "Guest".'],
    ],
    checks: [
      ['What does `true and false` give?', ['true', 'false', 'nil'], 1, 'and needs both sides to be true. One false makes the whole thing false.'],
      ['What does `nil or "Guest"` give?', ['nil', 'Guest', 'false'], 1, 'or gives the first value that counts as true. nil counts as false, so it moves on to "Guest".'],
    ],
    exercises: [
      { title: 'Two conditions', task: 'Print Allowed only if the player is level 10 or higher AND has a pass. Otherwise print Denied.', starter: 'local level = 12\nlocal hasPass = true\n-- decide with and\n', out: ['Allowed'], need: [[/\band\b/, 'the word and']], vary: [{ say: 'hasPass is false', set: [[/local hasPass = true/, 'local hasPass = false']], out: ['Denied'] }, { say: 'level is 3', set: [[/local level = 12/, 'local level = 3']], out: ['Denied'] }], hint: 'if level >= 10 and hasPass then ... else ... end', solution: 'local level = 12\nlocal hasPass = true\nif level >= 10 and hasPass then\n  print("Allowed")\nelse\n  print("Denied")\nend' },
      { title: 'A default name', task: 'Print the nickname, or Guest if the nickname is nil. Use or, with no if statement needed.', starter: 'local nickname = nil\n-- print the nickname or Guest\n', out: ['Guest'], need: [[/\bor\b/, 'the word or']], vary: [{ say: 'nickname is "Sky"', set: [[/local nickname = nil/, 'local nickname = "Sky"']], out: ['Sky'] }], hint: 'print(nickname or "Guest")', solution: 'local nickname = nil\nprint(nickname or "Guest")' },
    ],
    challenge: { title: 'The bouncer', task: 'A club lets someone in if they are 13 or older and have a ticket, OR if they are a VIP. Print Enter or Stay out. Use and, or, and brackets if you need them.', starter: 'local age = 15\nlocal hasTicket = true\nlocal isVip = false\n\n-- print Enter or Stay out\n', out: ['Enter'], vary: [{ say: 'age is 10', set: [[/local age = 15/, 'local age = 10']], out: ['Stay out'] }, { say: 'age is 10 but VIP', set: [[/local age = 15/, 'local age = 10'], [/local isVip = false/, 'local isVip = true']], out: ['Enter'] }, { say: 'no ticket', set: [[/local hasTicket = true/, 'local hasTicket = false']], out: ['Stay out'] }], need: [[/\band\b/, 'and'], [/\bor\b/, 'or']], hint: 'if (age >= 13 and hasTicket) or isVip then print("Enter") else print("Stay out") end', solution: 'local age = 15\nlocal hasTicket = true\nlocal isVip = false\nif (age >= 13 and hasTicket) or isVip then\n  print("Enter")\nelse\n  print("Stay out")\nend' },
  },

  'foundations-loops': {
    intro: 'A loop repeats code so you do not have to write it again and again. Loops spawn rows of parts, count down timers and check every player.',
    explain: [
      ['p', 'A **for loop** counts. The variable `i` takes each value from the start to the end.'],
      ['code', 'for i = 1, 3 do\n  print("Round", i)\nend', 'Prints Round 1, Round 2, Round 3.'],
      ['p', 'Add a third number to change the step. A negative step counts down.'],
      ['code', 'for i = 10, 0, -5 do\n  print(i)  -- 10, 5, 0\nend', ''],
      ['p', 'A **while loop** keeps going while its condition is true. Make sure something inside changes it, or it never stops. `break` leaves a loop early.'],
      ['code', 'local energy = 3\nwhile energy > 0 do\n  print("Energy", energy)\n  energy = energy - 1\nend', ''],
    ],
    checks: [
      ['How many times does `for i = 1, 4 do` run its body?', ['3', '4', '5'], 1, 'It counts 1, 2, 3, 4. That is four times.'],
      ['What goes wrong with `while true do print("x") end`?', ['Nothing', 'It never stops, because the condition is always true', 'It prints x once'], 1, 'A while loop only ends when its condition becomes false, or when you use break.'],
    ],
    exercises: [
      { title: 'Countdown', task: 'Print 5, 4, 3, 2, 1 on separate lines, then print Liftoff! Use a for loop that counts down.', starter: '-- count down from 5, then print Liftoff!\n', out: ['5', '4', '3', '2', '1', 'Liftoff!'], need: [[/\bfor\b/, 'a for loop']], hint: 'for i = 5, 1, -1 do print(i) end   then   print("Liftoff!") after the loop.', solution: 'for i = 5, 1, -1 do\n  print(i)\nend\nprint("Liftoff!")' },
      { title: 'Add them up', task: 'Use a loop to add the numbers 1 to 10 together, keeping the total in a variable called total. Print the total at the end.', starter: 'local total = 0\n-- add 1 to 10 into total\nprint(total)', out: ['55'], need: [[/\b(for|while)\b/, 'a loop']], hint: 'for i = 1, 10 do total = total + i end', solution: 'local total = 0\nfor i = 1, 10 do\n  total = total + i\nend\nprint(total)' },
    ],
    challenge: { title: 'Coin collector', task: 'A player earns 10 coins times the round number each round, for 5 rounds. Keep a running total in a variable called coins and, after each round, print: Round 1: 10 (the round number, then the total so far).', starter: 'local coins = 0\n\n-- loop through 5 rounds\n', out: ['Round 1: 10', 'Round 2: 30', 'Round 3: 60', 'Round 4: 100', 'Round 5: 150'], need: [[/\bfor\b|\bwhile\b/, 'a loop']], hint: 'for round = 1, 5 do coins = coins + round * 10 then print("Round " .. round .. ": " .. coins) end', solution: 'local coins = 0\nfor round = 1, 5 do\n  coins = coins + round * 10\n  print("Round " .. round .. ": " .. coins)\nend' },
  },

  'foundations-functions': {
    intro: 'A function is a named recipe: write the steps once, then use them whenever you like. Functions keep code organised and are the building blocks of every Roblox game.',
    explain: [
      ['p', 'Define a function with `function`, a name, brackets and `end`. Run it by writing its name with brackets. Whatever you put in the brackets is passed in as a **parameter**.'],
      ['code', 'local function greet(name)\n  print("Hello, " .. name)\nend\n\ngreet("Sam")\ngreet("Kai")', 'Two calls, two greetings.'],
      ['p', 'A function can hand a result back using `return`. Then you can store or print that result.'],
      ['code', 'local function double(n)\n  return n * 2\nend\n\nlocal answer = double(21)\nprint(answer) -- 42', 'return ends the function and sends the value out.'],
    ],
    checks: [
      ['What does `return` do?', ['Prints a value', 'Sends a value back to where the function was called', 'Repeats the function'], 1, 'return hands a result back and stops the function. print only shows something on screen.'],
      ['In `local function add(a, b)`, what are a and b?', ['Parameters, which are values the function receives', 'Functions', 'Comments'], 0, 'Parameters are named inputs. The values you pass in when you call the function fill them.'],
    ],
    exercises: [
      { title: 'Double it', task: 'Write a function called double that takes one number and returns it multiplied by 2.', starter: '-- write the double function\n', calls: [['double', [4], 8], ['double', [0], 0], ['double', [-3], -6]], need: [[/function\s+double|double\s*=\s*function/, 'a function called double'], [/\breturn\b/, 'return']], hint: 'local function double(n) return n * 2 end', solution: 'local function double(n)\n  return n * 2\nend' },
      { title: 'Even or odd', task: 'Write a function called isEven that returns true if a number is even and false if it is odd. Hint: an even number has no remainder when divided by 2.', starter: '-- write isEven\n', calls: [['isEven', [4], true], ['isEven', [7], false], ['isEven', [0], true]], hint: 'return n % 2 == 0', solution: 'local function isEven(n)\n  return n % 2 == 0\nend' },
    ],
    challenge: { title: 'Damage calculator', task: 'Write a function called calculateDamage(baseDamage, isCritical). A critical hit does double damage. Otherwise it returns the base damage. Then print the result of calculateDamage(15, true).', starter: '-- write calculateDamage, then print calculateDamage(15, true)\n', calls: [['calculateDamage', [10, false], 10], ['calculateDamage', [10, true], 20], ['calculateDamage', [7, true], 14]], out: ['30'], need: [[/\bif\b/, 'an if statement']], hint: 'Inside the function: if isCritical then return baseDamage * 2 end   then   return baseDamage', solution: 'local function calculateDamage(baseDamage, isCritical)\n  if isCritical then\n    return baseDamage * 2\n  end\n  return baseDamage\nend\nprint(calculateDamage(15, true))' },
  },

  'foundations-scope': {
    intro: 'Scope decides where a variable can be seen. Knowing it explains a very common beginner bug: a variable that mysteriously turns out to be nil.',
    explain: [
      ['p', 'A `local` variable only exists inside the block it was created in: a function, an `if`, a loop. Outside that block it is invisible.'],
      ['code', 'local function setScore()\n  local score = 10\nend\nsetScore()\nprint(score) -- nil! score only existed inside the function', 'The classic mistake.'],
      ['p', 'A variable created **outside** a function can be used and changed from inside it. The fix is to create it in the outer area.'],
      ['code', 'local score = 0\nlocal function addPoint()\n  score = score + 1\nend\naddPoint()\naddPoint()\nprint(score) -- 2', ''],
      ['tip', 'Always write `local`. Without it, a variable becomes global, which any script can change by accident. That causes bugs that are hard to find.'],
    ],
    checks: [
      ['A variable made with local inside a function can be used...', ['Anywhere in the script', 'Only inside that function', 'Only in other functions'], 1, 'Local variables live and die inside their own block.'],
      ['Why should you usually write local?', ['It makes code faster to type', 'It keeps the variable private so other code cannot change it by accident', 'It is required to print'], 1, 'Without local the variable becomes global and any code can overwrite it.'],
    ],
    exercises: [
      { title: 'Fix the missing score', task: 'This code should print 10, but it prints nil because of scope. Fix it so the score variable is created outside the function.', starter: 'local function setScore()\n  local score = 10\nend\nsetScore()\nprint(score)', out: ['10'], hint: 'Create local score = 0 above the function. Inside the function write score = 10 (without local).', solution: 'local score = 0\nlocal function setScore()\n  score = 10\nend\nsetScore()\nprint(score)' },
      { title: 'A counter', task: 'Finish addOne so each call increases count by 1. After three calls it should print 3.', starter: 'local count = 0\nlocal function addOne()\n  -- change count here\nend\naddOne()\naddOne()\naddOne()\nprint(count)', out: ['3'], hint: 'count = count + 1', solution: 'local count = 0\nlocal function addOne()\n  count = count + 1\nend\naddOne()\naddOne()\naddOne()\nprint(count)' },
    ],
    challenge: { title: 'Lives system', task: 'A player has 3 lives. Write loseLife() so that each call reduces lives by 1 and prints Lives left: N. When lives reach 0, also print Game over. The three calls at the bottom are already written.', starter: 'local lives = 3\n\n-- write loseLife here\n\nloseLife()\nloseLife()\nloseLife()', out: ['Lives left: 2', 'Lives left: 1', 'Lives left: 0', 'Game over'], need: [[/function\s+loseLife|loseLife\s*=\s*function/, 'a function called loseLife'], [/\bif\b/, 'an if statement']], hint: 'Inside the function: lives = lives - 1, then print("Lives left:", lives), then if lives == 0 then print("Game over") end', solution: 'local lives = 3\n\nlocal function loseLife()\n  lives = lives - 1\n  print("Lives left:", lives)\n  if lives == 0 then\n    print("Game over")\n  end\nend\n\nloseLife()\nloseLife()\nloseLife()' },
  },

  'foundations-tables': {
    intro: 'So far each variable holds one value. A table holds many, such as an inventory, a list of players or a player’s stats. Tables are the most important structure in Luau.',
    explain: [
      ['p', 'An **array** is a table that holds a list in order. Write it with curly brackets. Positions start at **1**, not 0, and you read them with square brackets.'],
      ['code', 'local items = {"Sword", "Shield", "Potion"}\nprint(items[1])   -- Sword\nprint(#items)     -- 3 (how many)\ntable.insert(items, "Bow")  -- add to the end\nprint(items[#items])        -- Bow', ''],
      ['p', 'A **dictionary** is a table with names (keys) instead of positions. Read and change values with a dot.'],
      ['code', 'local player = {name = "Sam", level = 3}\nprint(player.name)  -- Sam\nplayer.level = 4\nprint(player["level"]) -- 4', ''],
      ['p', 'Use `table.remove(items, 1)` to delete the item in position 1. The others shuffle down to fill the gap.'],
    ],
    checks: [
      ['In `{"a", "b", "c"}`, what is position 1?', ['"a"', '"b"', 'Nothing, lists start at 0'], 0, 'Luau lists start at 1. So position 1 is "a".'],
      ['How do you read the level of `player = {level = 3}`?', ['player.level', 'player(level)', 'level.player'], 0, 'A dot reads a value by its name: player.level gives 3.'],
    ],
    exercises: [
      { title: 'Make a list', task: 'Create a table called fruits holding "Apple", "Banana", "Cherry" in that order. Then print the second fruit and how many fruits there are.', starter: '-- create fruits, print the 2nd one, then the count\n', out: ['Banana', '3'], need: [[/local\s+fruits\s*=\s*\{/, 'a table called fruits']], hint: 'local fruits = {"Apple", "Banana", "Cherry"}   then   print(fruits[2])   and   print(#fruits)', solution: 'local fruits = {"Apple", "Banana", "Cherry"}\nprint(fruits[2])\nprint(#fruits)' },
      { title: 'Player stats', task: 'Change the player’s level to 4 using the dot, then print: Sam is level 4', starter: 'local player = {name = "Sam", level = 3}\n-- update the level, then print the message\n', out: ['Sam is level 4'], need: [[/player\.level\s*=[^=]|player\["level"\]\s*=[^=]/, 'a line that changes player.level']], hint: 'player.level = 4   then   print(player.name .. " is level " .. player.level)', solution: 'local player = {name = "Sam", level = 3}\nplayer.level = 4\nprint(player.name .. " is level " .. player.level)' },
    ],
    challenge: { title: 'Inventory list', task: 'Start with {"Sword", "Shield"}. Add "Potion" to the end, then remove the first item (the Sword). Print how many items are left, then print each remaining item on its own line using a for loop.', starter: 'local inventory = {"Sword", "Shield"}\n\n-- add, remove, then print\n', out: ['2', 'Shield', 'Potion'], need: [[/table\.insert/, 'table.insert'], [/table\.remove/, 'table.remove'], [/\bfor\b/, 'a for loop']], hint: 'table.insert(inventory, "Potion"), table.remove(inventory, 1), print(#inventory), then for i = 1, #inventory do print(inventory[i]) end', solution: 'local inventory = {"Sword", "Shield"}\ntable.insert(inventory, "Potion")\ntable.remove(inventory, 1)\nprint(#inventory)\nfor i = 1, #inventory do\n  print(inventory[i])\nend' },
  },

  'foundations-iterating-through-tables': {
    intro: 'Tables become powerful when you can visit every item. Looping through tables lets you give coins to every player, heal every teammate or find the best score.',
    explain: [
      ['p', 'Use `ipairs` for lists. It gives you each position (`index`) and the value in order.'],
      ['code', 'local names = {"Ann", "Bo", "Cy"}\nfor index, name in ipairs(names) do\n  print(index, name)\nend', ''],
      ['p', 'Use `pairs` for dictionaries. It gives you each key and its value. The order is not guaranteed, so do not rely on it.'],
      ['code', 'local stats = {strength = 5, speed = 3}\nfor key, value in pairs(stats) do\n  print(key, value)\nend', ''],
      ['tip', 'If you do not need the index, name it `_`, which is the usual way to say “I am ignoring this”: `for _, name in ipairs(names)`.'],
    ],
    checks: [
      ['Which loop is best for a dictionary like {strength = 5}?', ['ipairs', 'pairs', 'while'], 1, 'pairs visits every key and value. ipairs only walks numbered positions 1, 2, 3...'],
      ['In `for i, v in ipairs(t)`, what is v?', ['The position number', 'The value at that position', 'The length'], 1, 'i is the position and v is the value stored there.'],
    ],
    exercises: [
      { title: 'Add the scores', task: 'Use a loop to add every number in scores into total, then print total.', starter: 'local scores = {10, 20, 30, 40}\nlocal total = 0\n-- loop through scores\nprint(total)', out: ['100'], need: [[/\bipairs\b|\bpairs\b|\bfor\b/, 'a loop through the table']], vary: [{ say: 'scores is {5, 5}', set: [[/local scores = \{[^}]*\}/, 'local scores = {5, 5}']], out: ['10'] }], hint: 'for _, score in ipairs(scores) do total = total + score end', solution: 'local scores = {10, 20, 30, 40}\nlocal total = 0\nfor _, score in ipairs(scores) do\n  total = total + score\nend\nprint(total)' },
      { title: 'Total the stats', task: 'Add up every value in the stats dictionary and print the total. Use pairs.', starter: 'local stats = {strength = 5, speed = 3, luck = 2}\nlocal total = 0\n-- loop with pairs\nprint(total)', out: ['10'], need: [[/\bpairs\b/, 'pairs']], vary: [{ say: 'different stats', set: [[/local stats = \{[^}]*\}/, 'local stats = {a = 1, b = 1}']], out: ['2'] }], hint: 'for _, value in pairs(stats) do total = total + value end', solution: 'local stats = {strength = 5, speed = 3, luck = 2}\nlocal total = 0\nfor _, value in pairs(stats) do\n  total = total + value\nend\nprint(total)' },
    ],
    challenge: { title: 'Best score', task: 'Find the highest score in the list and count how many scores are above 50. Print two lines: Highest: N and Above 50: N.', starter: 'local scores = {45, 88, 52, 67, 30}\n\n-- find the highest and count the ones above 50\n', out: ['Highest: 88', 'Above 50: 3'], need: [[/\bipairs\b|\bpairs\b|\bfor\b/, 'a loop']], vary: [{ say: 'scores is {10, 20}', set: [[/local scores = \{[^}]*\}/, 'local scores = {10, 20}']], out: ['Highest: 20', 'Above 50: 0'] }], hint: 'Make two variables: highest = 0 and above = 0. In the loop: if score > highest then highest = score end, and if score > 50 then above = above + 1 end.', solution: 'local scores = {45, 88, 52, 67, 30}\nlocal highest = 0\nlocal above = 0\nfor _, score in ipairs(scores) do\n  if score > highest then\n    highest = score\n  end\n  if score > 50 then\n    above = above + 1\n  end\nend\nprint("Highest:", highest)\nprint("Above 50:", above)' },
  },

  'foundations-error-handling': {
    intro: 'Things go wrong in real games: data fails to load, or a script gets something unexpected. Error handling lets your game survive a problem instead of stopping completely.',
    explain: [
      ['p', 'When code hits an error, the script normally stops. `pcall` (protected call) runs a function safely. It returns `true` if all went well or `false` and the error message if it failed.'],
      ['code', 'local function risky()\n  error("Something broke")\nend\n\nlocal ok, message = pcall(risky)\nprint(ok)       -- false\nprint(message)  -- shows the error text', ''],
      ['p', 'Use `error("message")` to raise your own error when something is wrong, such as bad input. `assert(condition, "message")` is a shortcut that raises the error when the condition is false.'],
      ['code', 'local function divide(a, b)\n  assert(b ~= 0, "Cannot divide by zero")\n  return a / b\nend\nprint(pcall(divide, 10, 2)) -- true 5', 'Pass the function and its arguments to pcall separately.'],
    ],
    checks: [
      ['What does pcall return when the function fails?', ['true and the result', 'false and the error message', 'Nothing'], 1, 'The first value tells you whether it worked. After false, the second value is the error message.'],
      ['Why use pcall around risky code?', ['It makes the code faster', 'The script can keep going and handle the problem', 'It hides the code'], 1, 'Without pcall an error stops the script. With it you can react and carry on.'],
    ],
    exercises: [
      { title: 'Catch it', task: 'The function risky always fails. Call it safely with pcall. If it failed, print Caught an error.', starter: 'local function risky()\n  error("Oops")\nend\n\n-- call it safely\n', out: ['Caught an error'], need: [[/pcall/, 'pcall']], hint: 'local ok = pcall(risky)   then   if not ok then print("Caught an error") end', solution: 'local function risky()\n  error("Oops")\nend\n\nlocal ok = pcall(risky)\nif not ok then\n  print("Caught an error")\nend' },
      { title: 'Safe divide', task: 'Write divide(a, b). It returns a divided by b, but raises an error with error() or assert() when b is 0.', starter: '-- write divide\n', calls: [['divide', [10, 2], 5], ['divide', [9, 3], 3]], check: (c) => (c.throws('divide', 1, 0) ? undefined : 'divide(1, 0) should raise an error, but it did not. Use error("...") or assert(...) when b is 0.'), hint: 'if b == 0 then error("Cannot divide by zero") end   then   return a / b', solution: 'local function divide(a, b)\n  if b == 0 then\n    error("Cannot divide by zero")\n  end\n  return a / b\nend' },
    ],
    challenge: { title: 'Safe player loader', task: 'Write loadPlayer(data) which returns data.name, but raises an error (use assert) if data is nil. Then call it safely with pcall for nil data (print Could not load player when it fails) and for {name = "Sam"} (print Loaded: Sam).', starter: '-- write loadPlayer, then test it with pcall\n', out: ['Could not load player', 'Loaded: Sam'], need: [[/pcall/, 'pcall'], [/assert|error/, 'assert or error']], hint: 'local ok, name = pcall(loadPlayer, nil) gives false when data is nil. When ok is true, name holds the returned name.', solution: 'local function loadPlayer(data)\n  assert(data, "No data")\n  return data.name\nend\n\nlocal ok = pcall(loadPlayer, nil)\nif not ok then\n  print("Could not load player")\nend\n\nlocal ok2, name = pcall(loadPlayer, {name = "Sam"})\nif ok2 then\n  print("Loaded: " .. name)\nend' },
  },
};
